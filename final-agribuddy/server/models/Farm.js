const mongoose = require("mongoose")

const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    district: String,
    state: String,
    country: {
      type: String,
      default: "India"
    }
  },
  area: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ["acres", "hectares"],
      default: "acres"
    }
  },
  soilType: {
    type: String,
    enum: ["Clay", "Sandy", "Loamy", "Silty", "Peaty", "Chalky"],
    required: true
  },
  irrigationType: {
    type: String,
    enum: ["Drip", "Sprinkler", "Flood", "Furrow", "Center Pivot", "Manual"],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  crops: [{
    type: String,
    trim: true
  }],
  machinery: [{
    type: String,
    trim: true
  }],
  facilities: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  activeCropsCount: {
    type: Number,
    default: 0
  },
  totalInvestment: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  soilHealth: {
    pH: {
      type: Number,
      min: 0,
      max: 14
    },
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    organicMatter: Number,
    lastTested: Date
  },
  weatherStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WeatherData"
  },
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  certifications: [{
    type: {
      type: String,
      enum: ["Organic", "Fair Trade", "Rainforest Alliance", "GlobalGAP"]
    },
    number: String,
    issuedBy: String,
    validUntil: Date
  }],
  settings: {
    notifications: {
      weather: { type: Boolean, default: true },
      schedules: { type: Boolean, default: true },
      activities: { type: Boolean, default: true }
    },
    privacy: {
      public: { type: Boolean, default: false },
      shareWithExperts: { type: Boolean, default: true }
    }
  }
}, {
  timestamps: true
})

// Index for geospatial queries
farmSchema.index({ "location.coordinates": "2dsphere" })

// Virtual for area in different units
farmSchema.virtual("areaInHectares").get(function() {
  if (this.area.unit === "hectares") {
    return this.area.value
  }
  return this.area.value * 0.404686 // Convert acres to hectares
})

farmSchema.virtual("areaInAcres").get(function() {
  if (this.area.unit === "acres") {
    return this.area.value
  }
  return this.area.value * 2.47105 // Convert hectares to acres
})

// Method to calculate ROI
farmSchema.methods.calculateROI = function() {
  if (this.totalInvestment === 0) return 0
  return ((this.totalRevenue - this.totalInvestment) / this.totalInvestment) * 100
}

// Method to get nearby farms
farmSchema.methods.getNearbyFarms = function(radiusInKm = 10) {
  return this.constructor.find({
    _id: { $ne: this._id },
    "location.coordinates": {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: this.location.coordinates
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    }
  })
}

// Static method to find farms by soil type
farmSchema.statics.findBySoilType = function(soilType) {
  return this.find({ soilType, isActive: true })
}

// Pre-save middleware to update activeCropsCount
farmSchema.pre("save", function(next) {
  this.activeCropsCount = this.crops.length
  next()
})

module.exports = mongoose.model("Farm", farmSchema)
