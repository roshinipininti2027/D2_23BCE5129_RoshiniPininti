const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["farmer", "expert", "admin"],
      default: "farmer",
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      address: String,
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere",
      },
      state: String,
      district: String,
      pincode: String,
    },
    profile: {
      avatar: String,
      bio: String,
      experience: Number, // years of experience
      specialization: [String], // for experts
      languages: [String],
      farmingType: {
        type: String,
        enum: ["organic", "conventional", "mixed"],
        default: "conventional",
      },
    },
    preferences: {
      language: {
        type: String,
        default: "en",
      },
      notifications: {
        weather: {
          type: Boolean,
          default: true,
        },
        activities: {
          type: Boolean,
          default: true,
        },
        schedules: {
          type: Boolean,
          default: true,
        },
        consultations: {
          type: Boolean,
          default: true,
        },
        advisories: {
          type: Boolean,
          default: true,
        },
      },
      units: {
        temperature: {
          type: String,
          enum: ["celsius", "fahrenheit"],
          default: "celsius",
        },
        area: {
          type: String,
          enum: ["acres", "hectares"],
          default: "acres",
        },
        weight: {
          type: String,
          enum: ["kg", "tons", "quintals"],
          default: "kg",
        },
      },
    },
    expertise: {
      // For experts only
      qualifications: [String],
      certifications: [String],
      rating: {
        average: {
          type: Number,
          default: 0,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
      consultationsHandled: {
        type: Number,
        default: 0,
      },
      responseTime: {
        average: Number, // in milliseconds
        count: Number,
      },
    },
    farms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Farm",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ "location.coordinates": "2dsphere" })
userSchema.index({ isActive: 1 })

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return this.name
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Update login info
userSchema.methods.updateLoginInfo = function () {
  this.lastLogin = new Date()
  this.loginCount += 1
  return this.save()
}

// Get user's active farms
userSchema.methods.getActiveFarms = function () {
  return this.model("Farm").find({
    owner: this._id,
    isActive: true,
  })
}

// Static method to find experts by specialization
userSchema.statics.findExpertsBySpecialization = function (specialization, limit = 10) {
  return this.find({
    role: "expert",
    isActive: true,
    "profile.specialization": { $in: [specialization] },
  })
    .sort({ "expertise.rating.average": -1 })
    .limit(limit)
}

// Static method to find nearby farmers
userSchema.statics.findNearbyFarmers = function (coordinates, maxDistance = 50000) {
  return this.find({
    role: "farmer",
    isActive: true,
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: coordinates,
        },
        $maxDistance: maxDistance,
      },
    },
  })
}

// Method to update expert rating
userSchema.methods.updateExpertRating = function (newRating) {
  if (this.role !== "expert") return

  const currentAvg = this.expertise.rating.average
  const currentCount = this.expertise.rating.count

  this.expertise.rating.average = (currentAvg * currentCount + newRating) / (currentCount + 1)
  this.expertise.rating.count += 1

  return this.save()
}

// Method to update response time
userSchema.methods.updateResponseTime = function (responseTime) {
  if (this.role !== "expert") return

  const currentAvg = this.expertise.responseTime.average || 0
  const currentCount = this.expertise.responseTime.count || 0

  this.expertise.responseTime.average = (currentAvg * currentCount + responseTime) / (currentCount + 1)
  this.expertise.responseTime.count += 1

  return this.save()
}

module.exports = mongoose.model("User", userSchema)
