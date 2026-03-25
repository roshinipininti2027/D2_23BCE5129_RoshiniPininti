const express = require("express")
const WeatherData = require("../models/WeatherData")
const Farm = require("../models/Farm")
const auth = require("../middleware/auth")
const weatherService = require("../services/weatherService")

const router = express.Router()

// Get current weather for user's location
router.get("/current", auth, async (req, res) => {
  try {
    const { lat, lon } = req.query
    let latitude, longitude

    if (lat && lon) {
      latitude = Number.parseFloat(lat)
      longitude = Number.parseFloat(lon)
    } else {
      // Get user's first farm location
      const farm = await Farm.findOne({ owner: req.user.id, isActive: true })
      if (!farm || !farm.location || !farm.location.coordinates) {
        return res.status(404).json({
          message: "No location found. Please add a farm or provide coordinates.",
        })
      }
      longitude = farm.location.coordinates[0]
      latitude = farm.location.coordinates[1]
    }

    // Try to get recent weather data from database
    const recentWeather = await WeatherData.findNearLocation(latitude, longitude)

    if (recentWeather) {
      return res.json(recentWeather)
    }

    // Fetch fresh weather data from API
    const weatherData = await weatherService.getCurrentWeather(latitude, longitude)
    const forecastData = await weatherService.getWeatherForecast(latitude, longitude)
    const alerts = await weatherService.getWeatherAlerts(latitude, longitude)

    // Create new weather data document
    const newWeatherData = new WeatherData({
      location: {
        name: `Location ${latitude}, ${longitude}`,
        coordinates: {
          latitude: latitude,
          longitude: longitude,
        },
        address: weatherData.name || `${latitude}, ${longitude}`,
      },
      current: {
        temperature: weatherData.main.temp,
        feelsLike: weatherData.main.feels_like,
        humidity: weatherData.main.humidity,
        pressure: weatherData.main.pressure,
        windSpeed: weatherData.wind?.speed || 0,
        windDirection: weatherData.wind?.deg || 0,
        visibility: weatherData.visibility ? weatherData.visibility / 1000 : 0,
        uvIndex: weatherData.uvi || 0,
        cloudCover: weatherData.clouds?.all || 0,
        condition: weatherData.weather[0]?.main || "Clear",
        description: weatherData.weather[0]?.description || "Clear sky",
        icon: weatherData.weather[0]?.icon || "01d",
        rainfall: weatherData.rain ? weatherData.rain["1h"] || 0 : 0,
      },
      forecast: forecastData.list.slice(0, 5).map((item) => ({
        date: new Date(item.dt * 1000),
        temperature: {
          min: item.main.temp_min,
          max: item.main.temp_max,
          average: item.main.temp,
        },
        humidity: {
          average: item.main.humidity,
          min: item.main.humidity - 5,
          max: item.main.humidity + 5,
        },
        precipitation: {
          probability: (item.pop || 0) * 100,
          amount: item.rain ? item.rain["3h"] || 0 : 0,
          type: item.rain ? "rain" : "none",
        },
        windSpeed: {
          average: item.wind?.speed || 0,
          max: (item.wind?.speed || 0) * 1.2,
        },
        condition: item.weather[0]?.main || "Clear",
        description: item.weather[0]?.description || "Clear sky",
        icon: item.weather[0]?.icon || "01d",
      })),
      alerts: alerts.map((alert) => ({
        type: mapAlertType(alert.type),
        severity: mapAlertSeverity(alert.severity),
        title: alert.title,
        description: alert.message,
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        precautions: alert.recommendations || [],
      })),
      dataSource: {
        provider: "OpenWeatherMap",
        lastUpdated: new Date(),
      },
    })

    await newWeatherData.save()
    res.json(newWeatherData)
  } catch (error) {
    console.error("Error fetching weather:", error)
    res.status(500).json({
      message: "Failed to fetch weather data",
      error: error.message,
    })
  }
})

// Get weather forecast
router.get("/forecast", auth, async (req, res) => {
  try {
    const { lat, lon, days = 5 } = req.query
    let latitude, longitude

    if (lat && lon) {
      latitude = Number.parseFloat(lat)
      longitude = Number.parseFloat(lon)
    } else {
      const farm = await Farm.findOne({ owner: req.user.id, isActive: true })
      if (!farm || !farm.location || !farm.location.coordinates) {
        return res.status(404).json({ message: "No location found" })
      }
      longitude = farm.location.coordinates[0]
      latitude = farm.location.coordinates[1]
    }

    const forecastData = await weatherService.getWeatherForecast(latitude, longitude)

    const forecast = forecastData.list.slice(0, Number.parseInt(days)).map((item) => ({
      date: new Date(item.dt * 1000),
      temperature: {
        min: item.main.temp_min,
        max: item.main.temp_max,
        average: item.main.temp,
      },
      humidity: item.main.humidity,
      precipitation: {
        probability: (item.pop || 0) * 100,
        amount: item.rain ? item.rain["3h"] || 0 : 0,
      },
      windSpeed: item.wind?.speed || 0,
      condition: item.weather[0]?.main || "Clear",
      description: item.weather[0]?.description || "Clear sky",
      icon: item.weather[0]?.icon || "01d",
    }))

    res.json({ forecast })
  } catch (error) {
    console.error("Error fetching forecast:", error)
    res.status(500).json({ message: "Failed to fetch forecast data" })
  }
})

// Get weather alerts
router.get("/alerts", auth, async (req, res) => {
  try {
    const { lat, lon } = req.query
    let latitude, longitude

    if (lat && lon) {
      latitude = Number.parseFloat(lat)
      longitude = Number.parseFloat(lon)
    } else {
      const farm = await Farm.findOne({ owner: req.user.id, isActive: true })
      if (!farm || !farm.location || !farm.location.coordinates) {
        return res.status(404).json({ message: "No location found" })
      }
      longitude = farm.location.coordinates[0]
      latitude = farm.location.coordinates[1]
    }

    // Get recent weather data with alerts
    const weatherData = await WeatherData.findNearLocation(latitude, longitude)

    if (!weatherData) {
      return res.json({ alerts: [] })
    }

    const activeAlerts = weatherData.getActiveAlerts()

    res.json({
      alerts: activeAlerts,
      location: weatherData.location,
    })
  } catch (error) {
    console.error("Error fetching alerts:", error)
    res.status(500).json({ message: "Failed to fetch weather alerts" })
  }
})

// Get historical weather data
router.get("/historical", auth, async (req, res) => {
  try {
    const { lat, lon, days = 7 } = req.query
    let latitude, longitude

    if (lat && lon) {
      latitude = Number.parseFloat(lat)
      longitude = Number.parseFloat(lon)
    } else {
      const farm = await Farm.findOne({ owner: req.user.id, isActive: true })
      if (!farm || !farm.location || !farm.location.coordinates) {
        return res.status(404).json({ message: "No location found" })
      }
      longitude = farm.location.coordinates[0]
      latitude = farm.location.coordinates[1]
    }

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - Number.parseInt(days))

    const historicalData = await WeatherData.find({
      "location.coordinates.latitude": {
        $gte: latitude - 0.1,
        $lte: latitude + 0.1,
      },
      "location.coordinates.longitude": {
        $gte: longitude - 0.1,
        $lte: longitude + 0.1,
      },
      "dataSource.lastUpdated": {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ "dataSource.lastUpdated": -1 })

    const processedData = historicalData.map((data) => ({
      date: data.dataSource.lastUpdated,
      temperature: {
        current: data.current.temperature,
        min: data.forecast[0]?.temperature.min,
        max: data.forecast[0]?.temperature.max,
      },
      humidity: data.current.humidity,
      rainfall: data.current.rainfall,
      windSpeed: data.current.windSpeed,
      condition: data.current.condition,
      alerts: data.alerts.length,
    }))

    res.json({
      historical: processedData,
      summary: {
        avgTemperature:
          processedData.length > 0
            ? processedData.reduce((sum, d) => sum + d.temperature.current, 0) / processedData.length
            : 0,
        totalRainfall: processedData.reduce((sum, d) => sum + d.rainfall, 0),
        maxTemp: processedData.length > 0 ? Math.max(...processedData.map((d) => d.temperature.current)) : 0,
        minTemp: processedData.length > 0 ? Math.min(...processedData.map((d) => d.temperature.current)) : 0,
      },
    })
  } catch (error) {
    console.error("Error fetching historical weather:", error)
    res.status(500).json({ message: "Failed to fetch historical data" })
  }
})

// Get agricultural weather insights
router.get("/agricultural-insights", auth, async (req, res) => {
  try {
    const { cropType, lat, lon } = req.query
    let latitude, longitude

    if (lat && lon) {
      latitude = Number.parseFloat(lat)
      longitude = Number.parseFloat(lon)
    } else {
      const farm = await Farm.findOne({ owner: req.user.id, isActive: true })
      if (!farm || !farm.location || !farm.location.coordinates) {
        return res.status(404).json({ message: "No location found" })
      }
      longitude = farm.location.coordinates[0]
      latitude = farm.location.coordinates[1]
    }

    const weatherData = await WeatherData.findNearLocation(latitude, longitude)

    if (!weatherData) {
      return res.status(404).json({ message: "No weather data available" })
    }

    // Generate agricultural insights
    const insights = {
      irrigation: weatherData.getIrrigationRecommendation(),
      heatStress: {
        level:
          weatherData.current.temperature > 35 ? "high" : weatherData.current.temperature > 30 ? "moderate" : "low",
        recommendation:
          weatherData.current.temperature > 35
            ? "Provide shade and increase irrigation"
            : "Monitor temperature and maintain regular watering",
      },
      diseaseRisk: {
        fungal: weatherData.current.humidity > 80 ? "high" : weatherData.current.humidity > 60 ? "medium" : "low",
        bacterial: weatherData.current.temperature > 25 && weatherData.current.humidity > 70 ? "high" : "low",
      },
      pestActivity: {
        level: weatherData.current.temperature > 20 && weatherData.current.temperature < 35 ? "high" : "medium",
        recommendation: "Monitor for pest activity and apply preventive measures",
      },
      fieldWork: {
        suitability:
          weatherData.current.rainfall < 5 && weatherData.current.windSpeed < 15 ? "suitable" : "not suitable",
        recommendation:
          weatherData.current.rainfall > 5
            ? "Wait for soil to dry before field operations"
            : "Good conditions for field work",
      },
    }

    // Crop-specific recommendations
    if (cropType) {
      const cropRecommendations = await weatherService.getCropWeatherRecommendations(cropType, latitude, longitude)
      insights.cropSpecific = cropRecommendations
    }

    res.json({
      weather: {
        current: weatherData.current,
        location: weatherData.location,
      },
      insights,
      recommendations: generateFarmingRecommendations(weatherData, insights),
    })
  } catch (error) {
    console.error("Error fetching agricultural insights:", error)
    res.status(500).json({ message: "Failed to fetch agricultural insights" })
  }
})

// Helper function to map alert types
function mapAlertType(type) {
  const typeMap = {
    rainfall: "heavy_rain",
    high_temperature: "heat_wave",
    low_temperature: "cold_wave",
    high_humidity: "fog",
    high_wind: "wind_advisory",
  }
  return typeMap[type] || type
}

// Helper function to map alert severity
function mapAlertSeverity(severity) {
  const severityMap = {
    info: "Minor",
    warning: "Moderate",
    critical: "Severe",
  }
  return severityMap[severity] || severity
}

// Helper function to generate farming recommendations
function generateFarmingRecommendations(weatherData, insights) {
  const recommendations = []

  // Temperature-based recommendations
  if (weatherData.current.temperature > 35) {
    recommendations.push({
      type: "temperature",
      priority: "high",
      title: "Heat Protection Required",
      message: "Extreme heat conditions. Provide shade nets and increase irrigation frequency.",
      actions: ["Install shade nets", "Increase irrigation", "Apply mulching"],
    })
  }

  // Humidity-based recommendations
  if (weatherData.current.humidity > 80) {
    recommendations.push({
      type: "humidity",
      priority: "medium",
      title: "High Humidity Alert",
      message: "High humidity increases disease risk. Improve air circulation and monitor for fungal diseases.",
      actions: ["Improve ventilation", "Apply fungicide", "Reduce irrigation"],
    })
  }

  // Rainfall recommendations
  if (weatherData.current.rainfall > 10) {
    recommendations.push({
      type: "rainfall",
      priority: "medium",
      title: "Heavy Rainfall",
      message: "Heavy rain detected. Ensure proper drainage and postpone field activities.",
      actions: ["Check drainage", "Postpone spraying", "Protect harvested crops"],
    })
  }

  // Wind recommendations
  if (weatherData.current.windSpeed > 20) {
    recommendations.push({
      type: "wind",
      priority: "medium",
      title: "Strong Winds",
      message: "Strong winds may damage crops. Secure structures and support tall plants.",
      actions: ["Secure structures", "Support plants", "Avoid spraying"],
    })
  }

  return recommendations
}

module.exports = router
