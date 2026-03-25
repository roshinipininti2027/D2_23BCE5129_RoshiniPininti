const mongoose = require("mongoose")

const activityLogSchema = new mongoose.Schema({
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
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CropSchedule"
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop"
  },
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
      "pruning",
      "harvesting",
      "post_harvest",
      "soil_testing",
      "equipment_maintenance",
      "marketing",
      "training",
      "other"
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  duration: {
    hours: {
      type: Number,
      min: 0
    },
    minutes: {
      type: Number,
      min: 0,
      max: 59
    }
  },
  laborInvolved: [{
    name: String,
    type: {
      type: String,
      enum: ["family", "hired", "contractor", "cooperative"]
    },
    hours: Number,
    wage: Number,
    skill_level: {
      type: String,
      enum: ["unskilled", "semi_skilled", "skilled", "expert"]
    }
  }],
  materialsUsed: [{
    item: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: [
        "seeds",
        "fertilizer",
        "pesticide",
        "herbicide",
        "fungicide",
        "growth_regulator",
        "organic_input",
        "fuel",
        "equipment",
        "other"
      ]
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true
    },
    supplier: String,
    batch_number: String,
    expiry_date: Date
  }],
  machineryUsed: [{
    name: String,
    type: {
      type: String,
      enum: [
        "tractor",
        "harvester", 
        "plough",
        "seeder",
        "sprayer",
        "thresher",
        "cultivator",
        "pump",
        "other"
      ]
    },
    hours_used: Number,
    fuel_consumed: Number,
    operator: String,
    rental_cost: Number,
    maintenance_required: Boolean
  }],
  weatherConditions: {
    temperature: {
      min: Number,
      max: Number
    },
    humidity: Number,
    rainfall: Number,
    wind_speed: Number,
    weather_description: String,
    suitability: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor", "Unsuitable"]
    }
  },
  areaWorked: {
    value: Number,
    unit: String
  },
  results: {
    success_rate: {
      type: Number,
      min: 0,
      max: 100
    },
    quality_rating: {
      type: String,
      enum: ["Excellent", "Good", "Average", "Poor"]
    },
    yield_impact: {
      type: String,
      enum: ["Very_Positive", "Positive", "Neutral", "Negative", "Very_Negative"]
    },
    observations: String,
    measurements: [{
      parameter: String,
      value: Number,
      unit: String
    }]
  },
  costs: {
    labor: {
      type: Number,
      default: 0
    },
    materials: {
      type: Number,
      default: 0
    },
    machinery: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  images: [{
    url: String,
    caption: String,
    timestamp: Date
  }],
  videos: [{
    url: String,
    caption: String,
    duration: Number,
    timestamp: Date
  }],
  location: {
    coordinates: [Number], // [longitude, latitude]
    accuracy: Number
  },
  expertReviewed: {
    type: Boolean,
    default: false
  },
  expertFeedback: [{
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    suggestions: [String],
    date: Date
  }],
  tags: [String],
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Critical"],
    default: "Medium"
  },
  status: {
    type: String,
    enum: ["Planned", "In_Progress", "Completed", "Cancelled", "Delayed"],
    default: "Completed"
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  followUpNotes: String,
  linkedActivities: [{
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ActivityLog"
    },
    relationship: {
      type: String,
      enum: ["prerequisite", "follow_up", "related", "alternative"]
    }
  }],
  compliance: {
    organic_standards: Boolean,
    safety_protocols: Boolean,
    environmental_regulations: Boolean,
    certifications: [String]
  },
  sustainability: {
    water_usage: Number, // liters
    energy_consumption: Number, // kWh
    carbon_footprint: Number, // kg CO2
    waste_generated: Number, // kg
    recycling_rate: Number // %
  },
  notes: String,
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes for efficient querying
activityLogSchema.index({ farmer: 1, date: -1 })
activityLogSchema.index({ farm: 1, activityType: 1 })
activityLogSchema.index({ schedule: 1, status: 1 })
activityLogSchema.index({ date: 1, priority: 1 })

// Pre-save middleware to calculate total cost
activityLogSchema.pre("save", function(next) {
  // Calculate labor cost
  this.costs.labor = this.laborInvolved.reduce((sum, labor) => 
    sum + (labor.hours * labor.wage || 0), 0
  )
  
  // Calculate materials cost
  this.costs.materials = this.materialsUsed.reduce((sum, material) => 
    sum + material.cost, 0
  )
  
  // Calculate machinery cost
  this.costs.machinery = this.machineryUsed.reduce((sum, machine) => 
    sum + (machine.rental_cost || 0), 0
  )
  
  // Calculate total cost
  this.costs.total = this.costs.labor + this.costs.materials + 
                     this.costs.machinery + this.costs.other
  
  next()
})

// Virtual for activity efficiency
activityLogSchema.virtual("efficiency").get(function() {
  if (!this.duration.hours && !this.duration.minutes) return null
  
  const totalMinutes = (this.duration.hours * 60) + this.duration.minutes
  const areaWorked = this.areaWorked?.value || 1
  
  return {
    timePerUnit: totalMinutes / areaWorked,
    costPerUnit: this.costs.total / areaWorked,
    unit: this.areaWorked?.unit || "unit"
  }
})

// Method to get activity summary
activityLogSchema.methods.getSummary = function() {
  return {
    id: this._id,
    type: this.activityType,
    title: this.title,
    date: this.date,
    duration: this.duration,
    cost: this.costs.total,
    status: this.status,
    success_rate: this.results?.success_rate,
    quality: this.results?.quality_rating
  }
}

// Method to check if activity needs follow-up
activityLogSchema.methods.needsFollowUp = function() {
  return this.followUpRequired && 
         this.followUpDate && 
         this.followUpDate <= new Date() &&
         this.status === "Completed"
}

// Static method to get activities by date range
activityLogSchema.statics.getActivitiesByDateRange = function(farmerId, startDate, endDate) {
  return this.find({
    farmer: farmerId,
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ date: -1 })
}

// Static method to get cost analysis
activityLogSchema.statics.getCostAnalysis = function(farmerId, period = 'month') {
  const matchStage = { farmer: mongoose.Types.ObjectId(farmerId) }
  
  if (period === 'month') {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    matchStage.date = { $gte: startOfMonth }
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$activityType",
        totalCost: { $sum: "$costs.total" },
        count: { $sum: 1 },
        avgCost: { $avg: "$costs.total" }
      }
    },
    { $sort: { totalCost: -1 } }
  ])
}

module.exports = mongoose.model("ActivityLog", activityLogSchema)
