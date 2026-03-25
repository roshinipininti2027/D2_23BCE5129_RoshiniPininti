const mongoose = require("mongoose")

const weatherDataSchema = new mongoose.Schema(
  {
    location: {
      name: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
      address: String,
      district: String,
      state: String,
      country: {
        type: String,
        default: "India",
      },
    },
    current: {
      temperature: {
        type: Number,
        required: true,
      },
      feelsLike: Number,
      humidity: {
        type: Number,
        required: true,
      },
      pressure: Number,
      windSpeed: Number,
      windDirection: Number,
      visibility: Number,
      uvIndex: Number,
      cloudCover: Number,
      condition: String,
      description: String,
      icon: String,
      rainfall: {
        type: Number,
        default: 0,
      },
    },
    forecast: [
      {
        date: Date,
        temperature: {
          min: Number,
          max: Number,
          average: Number,
        },
        humidity: {
          min: Number,
          max: Number,
          average: Number,
        },
        precipitation: {
          probability: Number,
          amount: Number,
          type: {
            type: String,
            enum: ["none", "rain", "snow", "sleet"],
            default: "none",
          },
        },
        windSpeed: {
          average: Number,
          max: Number,
        },
        condition: String,
        description: String,
        icon: String,
      },
    ],
    alerts: [
      {
        type: {
          type: String,
          enum: [
            "heat_wave",
            "cold_wave",
            "heavy_rain",
            "drought",
            "cyclone",
            "hail",
            "frost",
            "fog",
            "thunderstorm",
            "wind_advisory",
            "high_temperature",
            "low_temperature",
            "high_humidity",
            "high_wind",
          ],
          required: true,
        },
        severity: {
          type: String,
          enum: ["Minor", "Moderate", "Severe", "Extreme", "warning", "critical"],
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        startTime: Date,
        endTime: Date,
        precautions: [String],
      },
    ],
    dataSource: {
      provider: {
        type: String,
        default: "OpenWeatherMap",
      },
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Create geospatial index for location-based queries
weatherDataSchema.index({
  "location.coordinates.latitude": 1,
  "location.coordinates.longitude": 1,
})
weatherDataSchema.index({ "dataSource.lastUpdated": -1 })
weatherDataSchema.index({ "location.district": 1, "location.state": 1 })

// Method to get active alerts
weatherDataSchema.methods.getActiveAlerts = function () {
  const now = new Date()
  return this.alerts.filter((alert) => {
    if (!alert.endTime) return true
    return alert.endTime > now
  })
}

// Method to get irrigation recommendation
weatherDataSchema.methods.getIrrigationRecommendation = function () {
  const current = this.current
  const forecast = this.forecast[0]

  let required = false
  let amount = 0
  let timing = "morning"
  const reasons = []

  // Check if rain is expected
  if (forecast && forecast.precipitation.probability > 70) {
    required = false
    reasons.push("Rain expected, irrigation not needed")
  } else if (current.temperature > 30 && current.humidity < 60) {
    required = true
    amount = 25
    timing = "early_morning"
    reasons.push("High temperature and low humidity require irrigation")
  } else if (current.humidity < 40) {
    required = true
    amount = 15
    reasons.push("Low humidity requires light irrigation")
  }

  return {
    required,
    amount,
    timing,
    reasons,
    method: current.windSpeed > 10 ? "drip" : "sprinkler",
  }
}

// Static method to find weather data near coordinates
weatherDataSchema.statics.findNearLocation = function (latitude, longitude, maxDistance = 10000) {
  return this.findOne({
    "location.coordinates.latitude": {
      $gte: latitude - 0.1,
      $lte: latitude + 0.1,
    },
    "location.coordinates.longitude": {
      $gte: longitude - 0.1,
      $lte: longitude + 0.1,
    },
    "dataSource.lastUpdated": {
      $gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
    },
  }).sort({ "dataSource.lastUpdated": -1 })
}

module.exports = mongoose.model("WeatherData", weatherDataSchema)
