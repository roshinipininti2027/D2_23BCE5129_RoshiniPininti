const mongoose = require("mongoose")

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  scientificName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: [
      "cereals",
      "pulses", 
      "oilseeds",
      "vegetables",
      "fruits",
      "spices",
      "cash_crops",
      "fodder",
      "flowers"
    ],
    required: true
  },
  varieties: [{
    name: String,
    duration: Number, // days
    yield: {
      min: Number,
      max: Number,
      unit: String
    },
    characteristics: [String],
    suitableRegions: [String]
  }],
  growthStages: [{
    stage: {
      type: String,
      enum: [
        "seed_preparation",
        "sowing",
        "germination", 
        "vegetative",
        "flowering",
        "fruiting",
        "maturity",
        "harvesting"
      ]
    },
    duration: Number, // days
    description: String,
    activities: [String],
    criticalFactors: [String]
  }],
  climaticRequirements: {
    temperature: {
      min: Number,
      max: Number,
      optimal: {
        min: Number,
        max: Number
      }
    },
    rainfall: {
      min: Number, // mm
      max: Number,
      optimal: {
        min: Number,
        max: Number
      }
    },
    humidity: {
      min: Number, // %
      max: Number
    },
    sunlight: {
      type: String,
      enum: ["full_sun", "partial_sun", "shade"]
    },
    season: {
      type: String,
      enum: ["kharif", "rabi", "zaid", "perennial"]
    }
  },
  soilRequirements: {
    type: [String],
    enum: [
      "clay",
      "sandy", 
      "loamy",
      "silt",
      "peaty",
      "chalky",
      "saline",
      "black_cotton",
      "red_laterite",
      "alluvial"
    ]
  },
  phRange: {
    min: Number,
    max: Number
  },
  waterRequirements: {
    total: Number, // mm for full crop cycle
    critical_stages: [{
      stage: String,
      requirement: Number // mm
    }],
    irrigation_frequency: String
  },
  nutritionRequirements: {
    nitrogen: Number, // kg/hectare
    phosphorus: Number,
    potassium: Number,
    organic_matter: Number,
    micronutrients: [{
      nutrient: String,
      quantity: Number,
      unit: String
    }]
  },
  commonPests: [{
    name: String,
    scientificName: String,
    symptoms: [String],
    preventiveMeasures: [String],
    treatment: [String],
    criticalStage: String
  }],
  commonDiseases: [{
    name: String,
    pathogen: String,
    symptoms: [String],
    preventiveMeasures: [String],
    treatment: [String],
    favorableConditions: [String]
  }],
  marketInfo: {
    averagePrice: {
      min: Number,
      max: Number,
      unit: String
    },
    demandSeasons: [String],
    majorMarkets: [String],
    exportPotential: Boolean,
    storageLife: Number, // days
    processingOptions: [String]
  },
  cultivationPractices: {
    landPreparation: [String],
    seedTreatment: [String],
    sowingMethod: {
      type: String,
      enum: ["broadcasting", "line_sowing", "transplanting", "dibbling"]
    },
    seedRate: {
      value: Number,
      unit: String
    },
    spacing: {
      row: Number, // cm
      plant: Number // cm
    },
    fertilization: [{
      stage: String,
      fertilizer: String,
      quantity: Number,
      unit: String,
      method: String
    }],
    weedManagement: [String],
    harvesting: {
      indicators: [String],
      method: String,
      postHarvest: [String]
    }
  },
  economicAnalysis: {
    costOfCultivation: {
      seeds: Number,
      fertilizers: Number,
      pesticides: Number,
      labor: Number,
      machinery: Number,
      irrigation: Number,
      other: Number,
      total: Number
    },
    breakEvenYield: Number,
    profitMargin: {
      min: Number,
      max: Number
    }
  },
  sustainabilityFactors: {
    carbonFootprint: Number,
    waterEfficiency: String,
    soilHealth: String,
    biodiversityImpact: String,
    organicCompatible: Boolean
  },
  regions: [{
    state: String,
    districts: [String],
    suitability: {
      type: String,
      enum: ["highly_suitable", "suitable", "moderately_suitable", "not_suitable"]
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  images: [String],
  videos: [String],
  documents: [String]
}, {
  timestamps: true
})

// Index for efficient searching
cropSchema.index({ name: "text", category: 1 })
cropSchema.index({ "regions.state": 1, "regions.districts": 1 })

// Method to check crop suitability for given conditions
cropSchema.methods.checkSuitability = function(conditions) {
  const { temperature, rainfall, soilType, region } = conditions
  let suitabilityScore = 0
  let factors = []

  // Check temperature
  if (temperature >= this.climaticRequirements.temperature.min && 
      temperature <= this.climaticRequirements.temperature.max) {
    suitabilityScore += 25
    factors.push("Temperature suitable")
  } else {
    factors.push("Temperature not optimal")
  }

  // Check rainfall
  if (rainfall >= this.climaticRequirements.rainfall.min && 
      rainfall <= this.climaticRequirements.rainfall.max) {
    suitabilityScore += 25
    factors.push("Rainfall suitable")
  } else {
    factors.push("Rainfall not optimal")
  }

  // Check soil type
  if (this.soilRequirements.includes(soilType)) {
    suitabilityScore += 25
    factors.push("Soil type suitable")
  } else {
    factors.push("Soil type not optimal")
  }

  // Check region
  const regionMatch = this.regions.find(r => 
    r.state === region.state && r.districts.includes(region.district)
  )
  if (regionMatch) {
    suitabilityScore += 25
    factors.push(`Region ${regionMatch.suitability}`)
  } else {
    factors.push("Region data not available")
  }

  return {
    score: suitabilityScore,
    rating: suitabilityScore >= 75 ? "Highly Suitable" : 
            suitabilityScore >= 50 ? "Suitable" : 
            suitabilityScore >= 25 ? "Moderately Suitable" : "Not Suitable",
    factors
  }
}

// Method to get current growth stage based on planting date
cropSchema.methods.getCurrentStage = function(plantingDate) {
  const daysSincePlanting = Math.floor((new Date() - new Date(plantingDate)) / (1000 * 60 * 60 * 24))
  let cumulativeDays = 0
  
  for (let stage of this.growthStages) {
    cumulativeDays += stage.duration
    if (daysSincePlanting <= cumulativeDays) {
      return {
        ...stage.toObject(),
        daysInStage: daysSincePlanting - (cumulativeDays - stage.duration),
        daysRemaining: cumulativeDays - daysSincePlanting
      }
    }
  }
  
  return this.growthStages[this.growthStages.length - 1]
}

module.exports = mongoose.model("Crop", cropSchema)
