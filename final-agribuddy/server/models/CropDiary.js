const mongoose = require("mongoose")

const cropDiarySchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
    crop: {
      name: {
        type: String,
        required: true,
      },
      variety: String,
      season: {
        type: String,
        enum: ["kharif", "rabi", "zaid", "perennial"],
        required: true,
      },
      category: {
        type: String,
        enum: ["cereals", "pulses", "oilseeds", "vegetables", "fruits", "spices", "cash-crops"],
        required: true,
      },
    },
    area: {
      value: {
        type: Number,
        required: true,
        min: 0,
      },
      unit: {
        type: String,
        enum: ["acres", "hectares", "square-meters"],
        default: "acres",
      },
    },
    plantingDate: {
      type: Date,
      required: true,
    },
    expectedHarvestDate: Date,
    actualHarvestDate: Date,
    status: {
      type: String,
      enum: ["active", "completed", "abandoned"],
      default: "active",
    },
    currentStage: {
      name: {
        type: String,
        enum: [
          "land-preparation",
          "sowing",
          "germination",
          "vegetative-growth",
          "flowering",
          "fruit-development",
          "maturation",
          "harvesting",
        ],
      },
      startDate: Date,
      status: {
        type: String,
        enum: ["not-started", "in-progress", "completed"],
        default: "not-started",
      },
    },
    activities: [
      {
        date: {
          type: Date,
          required: true,
        },
        type: {
          type: String,
          enum: [
            "land-preparation",
            "sowing",
            "irrigation",
            "fertilization",
            "weeding",
            "pest-control",
            "disease-management",
            "pruning",
            "harvesting",
            "post-harvest",
            "observation",
            "other",
          ],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        cost: {
          amount: {
            type: Number,
            default: 0,
            min: 0,
          },
          currency: {
            type: String,
            default: "INR",
          },
        },
        labor: {
          hours: Number,
          workers: Number,
          cost: Number,
        },
        materials: [
          {
            name: String,
            quantity: Number,
            unit: String,
            cost: Number,
          },
        ],
        weather: {
          temperature: Number,
          humidity: Number,
          rainfall: Number,
          conditions: String,
        },
        images: [
          {
            url: String,
            description: String,
            uploadedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        notes: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    economics: {
      totalInvestment: {
        type: Number,
        default: 0,
      },
      breakdown: {
        seeds: { type: Number, default: 0 },
        fertilizers: { type: Number, default: 0 },
        pesticides: { type: Number, default: 0 },
        labor: { type: Number, default: 0 },
        irrigation: { type: Number, default: 0 },
        equipment: { type: Number, default: 0 },
        other: { type: Number, default: 0 },
      },
      revenue: {
        totalRevenue: { type: Number, default: 0 },
        pricePerUnit: Number,
        soldQuantity: Number,
        unit: String,
      },
      profit: {
        type: Number,
        default: 0,
      },
      roi: {
        type: Number,
        default: 0,
      },
    },
    yield: {
      expected: {
        quantity: Number,
        unit: String,
      },
      actual: {
        quantity: Number,
        unit: String,
        quality: {
          type: String,
          enum: ["excellent", "good", "average", "poor"],
        },
      },
    },
    soilData: {
      pH: Number,
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      organicMatter: Number,
      testDate: Date,
    },
    challenges: [
      {
        type: {
          type: String,
          enum: ["pest", "disease", "weather", "soil", "water", "market", "other"],
        },
        description: String,
        severity: {
          type: String,
          enum: ["low", "medium", "high", "critical"],
        },
        dateIdentified: Date,
        resolution: String,
        resolved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    notes: String,
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
cropDiarySchema.index({ farmer: 1, status: 1 })
cropDiarySchema.index({ farm: 1, status: 1 })
cropDiarySchema.index({ "crop.name": 1, "crop.season": 1 })
cropDiarySchema.index({ plantingDate: 1 })
cropDiarySchema.index({ status: 1, createdAt: -1 })

// Virtual for days since planting
cropDiarySchema.virtual("daysSincePlanting").get(function () {
  if (!this.plantingDate) return 0
  return Math.floor((Date.now() - this.plantingDate.getTime()) / (1000 * 60 * 60 * 24))
})

// Virtual for total activities count
cropDiarySchema.virtual("totalActivities").get(function () {
  return this.activities ? this.activities.length : 0
})

// Virtual for latest activity
cropDiarySchema.virtual("latestActivity").get(function () {
  if (!this.activities || this.activities.length === 0) return null
  return this.activities[this.activities.length - 1]
})

// Method to add activity
cropDiarySchema.methods.addActivity = function (activityData) {
  this.activities.push({
    ...activityData,
    createdAt: new Date(),
  })

  // Update economics
  if (activityData.cost && activityData.cost.amount) {
    this.economics.totalInvestment += activityData.cost.amount

    // Update breakdown based on activity type
    switch (activityData.type) {
      case "fertilization":
        this.economics.breakdown.fertilizers += activityData.cost.amount
        break
      case "pest-control":
        this.economics.breakdown.pesticides += activityData.cost.amount
        break
      case "irrigation":
        this.economics.breakdown.irrigation += activityData.cost.amount
        break
      default:
        this.economics.breakdown.other += activityData.cost.amount
    }
  }

  // Update labor costs
  if (activityData.labor && activityData.labor.cost) {
    this.economics.breakdown.labor += activityData.labor.cost
    this.economics.totalInvestment += activityData.labor.cost
  }

  // Recalculate profit and ROI
  this.calculateProfitAndROI()

  return this.save()
}

// Method to update crop stage
cropDiarySchema.methods.updateStage = function (stageName) {
  this.currentStage = {
    name: stageName,
    startDate: new Date(),
    status: "in-progress",
  }

  return this.save()
}

// Method to complete stage
cropDiarySchema.methods.completeStage = function () {
  if (this.currentStage) {
    this.currentStage.status = "completed"
  }

  return this.save()
}

// Method to add challenge
cropDiarySchema.methods.addChallenge = function (challengeData) {
  this.challenges.push({
    ...challengeData,
    dateIdentified: new Date(),
  })

  return this.save()
}

// Method to resolve challenge
cropDiarySchema.methods.resolveChallenge = function (challengeId, resolution) {
  const challenge = this.challenges.id(challengeId)
  if (challenge) {
    challenge.resolution = resolution
    challenge.resolved = true
  }

  return this.save()
}

// Method to record harvest
cropDiarySchema.methods.recordHarvest = function (harvestData) {
  this.actualHarvestDate = harvestData.date || new Date()
  this.yield.actual = {
    quantity: harvestData.quantity,
    unit: harvestData.unit,
    quality: harvestData.quality,
  }

  if (harvestData.revenue) {
    this.economics.revenue = harvestData.revenue
    this.economics.totalRevenue = harvestData.revenue.totalRevenue
  }

  this.status = "completed"
  this.calculateProfitAndROI()

  return this.save()
}

// Method to calculate profit and ROI
cropDiarySchema.methods.calculateProfitAndROI = function () {
  this.economics.profit = this.economics.revenue.totalRevenue - this.economics.totalInvestment

  if (this.economics.totalInvestment > 0) {
    this.economics.roi = (this.economics.profit / this.economics.totalInvestment) * 100
  }
}

// Static method to get active diaries for farmer
cropDiarySchema.statics.getActiveDiariesForFarmer = function (farmerId) {
  return this.find({
    farmer: farmerId,
    status: "active",
    isActive: true,
  })
    .populate("farm", "name location")
    .sort({ plantingDate: -1 })
}

// Static method to get dashboard summary
cropDiarySchema.statics.getDashboardSummary = function (farmerId) {
  return this.aggregate([
    { $match: { farmer: farmerId, isActive: true } },
    {
      $group: {
        _id: null,
        activeDiaries: {
          $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
        },
        completedDiaries: {
          $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
        },
        totalInvestment: { $sum: "$economics.totalInvestment" },
        totalRevenue: { $sum: "$economics.revenue.totalRevenue" },
        totalProfit: { $sum: "$economics.profit" },
      },
    },
  ])
}

// Pre-save middleware
cropDiarySchema.pre("save", function (next) {
  // Recalculate economics when activities are modified
  if (this.isModified("activities")) {
    let totalInvestment = 0
    const breakdown = {
      seeds: 0,
      fertilizers: 0,
      pesticides: 0,
      labor: 0,
      irrigation: 0,
      equipment: 0,
      other: 0,
    }

    this.activities.forEach((activity) => {
      if (activity.cost && activity.cost.amount) {
        totalInvestment += activity.cost.amount

        switch (activity.type) {
          case "sowing":
            breakdown.seeds += activity.cost.amount
            break
          case "fertilization":
            breakdown.fertilizers += activity.cost.amount
            break
          case "pest-control":
            breakdown.pesticides += activity.cost.amount
            break
          case "irrigation":
            breakdown.irrigation += activity.cost.amount
            break
          default:
            breakdown.other += activity.cost.amount
        }
      }

      if (activity.labor && activity.labor.cost) {
        breakdown.labor += activity.labor.cost
        totalInvestment += activity.labor.cost
      }
    })

    this.economics.totalInvestment = totalInvestment
    this.economics.breakdown = breakdown
    this.calculateProfitAndROI()
  }

  next()
})

module.exports = mongoose.model("CropDiary", cropDiarySchema)
