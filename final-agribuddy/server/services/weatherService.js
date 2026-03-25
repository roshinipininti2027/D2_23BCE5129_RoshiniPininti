const axios = require("axios")
const WeatherData = require("../models/WeatherData")
const User = require("../models/User")
const cron = require("node-cron")

class WeatherService {
  constructor() {
    this.apiKey = process.env.WEATHER_API_KEY
    this.baseUrl = "https://api.openweathermap.org/data/2.5"
  }

  // Fetch current weather data
  async getCurrentWeather(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: "metric",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching current weather:", error)
      throw error
    }
  }

  // Fetch 5-day weather forecast
  async getWeatherForecast(lat, lon) {
    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: "metric",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching weather forecast:", error)
      throw error
    }
  }

  // Get weather alerts for farming
  async getWeatherAlerts(lat, lon) {
    try {
      const currentWeather = await this.getCurrentWeather(lat, lon)
      const forecast = await this.getWeatherForecast(lat, lon)

      const alerts = []

      // Temperature alerts
      if (currentWeather.main.temp > 35) {
        alerts.push({
          type: "high_temperature",
          severity: "warning",
          title: "High Temperature Alert",
          message: "Temperature is above 35°C. Consider providing shade for crops and increase irrigation.",
          recommendations: [
            "Increase irrigation frequency",
            "Provide shade nets for sensitive crops",
            "Avoid fertilizer application during peak heat",
          ],
        })
      }

      if (currentWeather.main.temp < 5) {
        alerts.push({
          type: "low_temperature",
          severity: "critical",
          title: "Frost Warning",
          message: "Temperature is below 5°C. Protect crops from frost damage.",
          recommendations: ["Cover sensitive plants", "Use frost protection methods", "Delay planting if possible"],
        })
      }

      // Rainfall alerts
      const upcomingRain = forecast.list.slice(0, 8).some((item) => item.weather[0].main === "Rain")

      if (upcomingRain) {
        alerts.push({
          type: "heavy_rain",
          severity: "Minor",
          title: "Rain Expected",
          message: "Rain is expected in the next 24 hours.",
          recommendations: ["Postpone irrigation", "Ensure proper drainage", "Harvest ready crops if possible"],
        })
      }

      // Wind alerts
      if (currentWeather.wind && currentWeather.wind.speed > 10) {
        alerts.push({
          type: "high_wind",
          severity: "warning",
          title: "High Wind Alert",
          message: "Strong winds detected. Secure loose structures and support tall plants.",
          recommendations: [
            "Secure greenhouse structures",
            "Support tall plants with stakes",
            "Avoid spraying pesticides",
          ],
        })
      }

      // Humidity alerts
      if (currentWeather.main.humidity > 85) {
        alerts.push({
          type: "high_humidity",
          severity: "warning",
          title: "High Humidity Alert",
          message: "High humidity may promote fungal diseases.",
          recommendations: ["Improve air circulation", "Monitor for fungal diseases", "Reduce irrigation if possible"],
        })
      }

      return alerts
    } catch (error) {
      console.error("Error generating weather alerts:", error)
      return []
    }
  }

  // Start automatic weather data synchronization
  startWeatherSync() {
    console.log("🌤️  Starting weather data synchronization...")

    // Sync weather data every 30 minutes
    cron.schedule("*/30 * * * *", async () => {
      try {
        console.log("🔄 Syncing weather data...")
        await this.syncAllUsersWeatherData()
        console.log("✅ Weather data sync completed")
      } catch (error) {
        console.error("❌ Weather sync failed:", error)
      }
    })

    // Initial sync after 5 seconds
    setTimeout(() => {
      this.syncAllUsersWeatherData()
    }, 5000)
  }

  // Sync weather data for all users
  async syncAllUsersWeatherData() {
    try {
      const users = await User.find({
        location: { $exists: true },
        "location.coordinates": { $exists: true },
      })

      for (const user of users) {
        if (user.location && user.location.coordinates && user.location.coordinates.length === 2) {
          const [lon, lat] = user.location.coordinates

          try {
            const weatherData = await this.getCurrentWeather(lat, lon)

            // Create weather data document
            const newWeatherData = new WeatherData({
              location: {
                name: user.location.address || `${lat}, ${lon}`,
                coordinates: {
                  latitude: lat,
                  longitude: lon,
                },
                address: user.location.address,
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
              forecast: [],
              alerts: [],
              dataSource: {
                provider: "OpenWeatherMap",
                lastUpdated: new Date(),
              },
            })

            await newWeatherData.save()
          } catch (error) {
            console.error(`Error syncing weather for user ${user._id}:`, error.message)
          }
        }
      }
    } catch (error) {
      console.error("Error in syncAllUsersWeatherData:", error)
    }
  }

  // Generate crop-specific weather recommendations
  async getCropWeatherRecommendations(cropType, lat, lon) {
    try {
      const currentWeather = await this.getCurrentWeather(lat, lon)
      const forecast = await this.getWeatherForecast(lat, lon)

      const recommendations = []

      // Crop-specific temperature recommendations
      const cropTempRanges = {
        rice: { min: 20, max: 35 },
        wheat: { min: 15, max: 25 },
        corn: { min: 18, max: 32 },
        tomato: { min: 18, max: 29 },
        potato: { min: 15, max: 24 },
      }

      const tempRange = cropTempRanges[cropType.toLowerCase()]
      if (tempRange) {
        const temp = currentWeather.main.temp

        if (temp < tempRange.min) {
          recommendations.push({
            type: "temperature",
            message: `Temperature (${temp}°C) is below optimal range for ${cropType}. Consider protection measures.`,
            action: "Provide frost protection or delay planting",
          })
        } else if (temp > tempRange.max) {
          recommendations.push({
            type: "temperature",
            message: `Temperature (${temp}°C) is above optimal range for ${cropType}. Increase cooling measures.`,
            action: "Increase irrigation and provide shade",
          })
        }
      }

      // Irrigation recommendations based on rainfall
      const recentRain = forecast.list.slice(0, 3).reduce((total, item) => {
        return total + (item.rain ? item.rain["3h"] || 0 : 0)
      }, 0)

      if (recentRain < 5) {
        recommendations.push({
          type: "irrigation",
          message: "Low rainfall expected. Plan irrigation accordingly.",
          action: "Schedule irrigation for the next 2-3 days",
        })
      }

      return recommendations
    } catch (error) {
      console.error("Error generating crop weather recommendations:", error)
      return []
    }
  }
}

module.exports = new WeatherService()
