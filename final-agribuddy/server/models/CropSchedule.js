const mongoose = require("mongoose")

const cropScheduleSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  farm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farm",
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop",
    required: true
  },
  variety: {
    type: String,
    required: true
  },
  season: {
    type: String,
    enum: ["kharif", "rabi", "zaid", "perennial"],
    required: true
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  area: {
    value: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ["acres", "hectares", "square_meters"],
      default: "acres"
    }
  },
  plantingDate: {
    type: Date,
    required: true
  },
  expectedHarvestDate: {
    type: Date,
    required: true
  },
  actualHarvestDate: Date,
  status: {
    type: String,
    enum: [
      "Planned",
      "Land_Preparation", 
      "Sowing",
      "Germination",
      "Vegetative_Growth",
      "Flowering",
      "Fruiting",
      "Maturity",
      "Harvesting",
      "Completed",
      "Failed"
    ],
    default: "Planned"
  },
  activities: [{
    activityType: {
      type: String,
      enum: [
        "land_preparation",
        "seed_treatment",
        "sowing",
        "irrigation",
        "fertilization",
        "weeding",
        "pest_control",
        "disease_management",
        "harvesting",
        "post_harvest",
        "other"
      ],
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    completedDate: Date,
    description: {
      type: String,
      required: true
    },
    materials: [{
      item: String,
      quantity: Number,
      unit: String,
      cost: Number
    }],
    laborRequired: {
      type: Number,
      default: 0
    },
    machineryRequired: [String],
    status: {
      type: String,
      enum: ["Pending", "In_Progress", "Completed", "Skipped", "Delayed"],
      default: "Pending"
    },
    notes: String,
    images: [String],
    weather_dependency: {
      type: Boolean,
      default: false
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    }
  }],
  expectedYield: {
    quantity: Number,
    unit: String
  },
  actualYield: {
    quantity: Number,
    unit: String
  },
  costEstimate: {
    seeds: Number,
    fertilizers: Number,
    pesticides: Number,
    labor: Number,
    machinery: Number,
    irrigation: Number,
    other: Number,
    total: Number
  },
  actualCost: {
    seeds: Number,
    fertilizers: Number,
    pesticides: Number,
    labor: Number,
    machinery: Number,
    irrigation: Number,
    other: Number,
    total: Number
  },
  revenueEstimate: Number,
  actualRevenue: Number,
  profitMargin: Number,
  weatherAlerts: [{
    alertType: String,
    message: String,
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"]
    },
    date: Date,
    acknowledged: {
      type: Boolean,
      default: false
    }
  }],
  expertRecommendations: [{
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    recommendation: String,
    category: {
      type: String,
      enum: ["general", "pest_control", "fertilization", "irrigation", "harvesting"]
    },
    date: Date,
    implemented: {
      type: Boolean,
      default: false
    },
    feedback: String
  }],
  challenges: [{
    type: {
      type: String,
      enum: [
        "weather",
        "pest_attack",
        "disease",
        "nutrient_deficiency",
        "water_shortage",
        "labor_shortage",
        "market_price",
        "other"
      ]
    },
    description: String,
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"]
    },
    date: Date,
    resolution: String,
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  qualityMetrics: {
    grade: String,
    moistureContent: Number,
    pestResidues: Boolean,
    organicCertified: Boolean,
    marketAcceptance: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Poor"]
    }
  },
  sustainabilityMetrics: {
    waterUsage: Number, // liters
    carbonFootprint: Number, // kg CO2
    soilHealthImpact: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"]
    },
    biodiversityImpact: {
      type: String,
      enum: ["Positive", "Neutral", "Negative"]
    }
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes for efficient querying
cropScheduleSchema.index({ farmer: 1, season: 1, year: 1 })
cropScheduleSchema.index({ farm: 1, status: 1 })
cropScheduleSchema.index({ plantingDate: 1, expectedHarvestDate: 1 })

// Virtual for schedule duration
cropScheduleSchema.virtual("duration").get(function() {
  return Math.ceil((this.expectedHarvestDate - this.plantingDate) / (1000 * 60 * 60 * 24))
})

// Virtual for progress percentage
cropScheduleSchema.virtual("progressPercentage").get(function() {
  const totalActivities = this.activities.length
  if (totalActivities === 0) return 0
  
  const completedActivities = this.activities.filter(activity => 
    activity.status === "Completed"
  ).length
  
  return Math.round((completedActivities / totalActivities) * 100)
})

// Method to get pending activities
cropScheduleSchema.methods.getPendingActivities = function() {
  return this.activities.filter(activity => 
    activity.status === "Pending" && activity.scheduledDate <= new Date()
  ).sort((a, b) => a.scheduledDate - b.scheduledDate)
}

// Method to get upcoming activities
cropScheduleSchema.methods.getUpcomingActivities = function(days = 7) {
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  
  return this.activities.filter(activity => 
    activity.status === "Pending" && 
    activity.scheduledDate > new Date() && 
    activity.scheduledDate <= futureDate
  ).sort((a, b) => a.scheduledDate - b.scheduledDate)
}

// Method to calculate ROI
cropScheduleSchema.methods.calculateROI = function() {
  if (!this.actualRevenue || !this.actualCost.total) return 0
  return ((this.actualRevenue - this.actualCost.total) / this.actualCost.total) * 100
}

// Pre-save middleware to update profit margin
cropScheduleSchema.pre("save", function(next) {
  if (this.actualRevenue && this.actualCost.total) {
    this.profitMargin = this.actualRevenue - this.actualCost.total
  }
  next()
})

module.exports = mongoose.model("CropSchedule", cropScheduleSchema)
