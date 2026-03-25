"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import PrivateRoute from "../components/PrivateRoute"
import Navbar from "../components/Navbar"
import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Gauge, AlertTriangle, MapPin } from "lucide-react"
import axios from "axios"

export default function Weather() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [weatherData, setWeatherData] = useState<any>(null)
  const [forecast, setForecast] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState("")

  useEffect(() => {
    fetchWeatherData()
  }, [])

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get("/api/weather/current")
      setWeatherData(response.data)
      setForecast(response.data.forecast || [])
      setLocation(response.data.location || user?.location || "")
    } catch (error) {
      console.error("Error fetching weather data:", error)
      // Mock data for demonstration
      setWeatherData({
        current: {
          temperature: 28,
          condition: "Partly Cloudy",
          humidity: 65,
          windSpeed: 12,
          pressure: 1013,
          visibility: 10,
          uvIndex: 6,
        },
        alerts: [
          {
            type: "Rain",
            severity: "Moderate",
            title: "Rain Expected",
            description: "Light to moderate rain expected tomorrow. Consider covering sensitive crops.",
            startTime: new Date(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        ],
      })
      setForecast([
        {
          date: new Date(),
          temperature: { min: 22, max: 28 },
          condition: "Partly Cloudy",
          precipitation: { probability: 20 },
        },
        {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          temperature: { min: 20, max: 25 },
          condition: "Rainy",
          precipitation: { probability: 80 },
        },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          temperature: { min: 23, max: 29 },
          condition: "Sunny",
          precipitation: { probability: 10 },
        },
        {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          temperature: { min: 24, max: 30 },
          condition: "Partly Cloudy",
          precipitation: { probability: 30 },
        },
        {
          date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          temperature: { min: 21, max: 27 },
          condition: "Cloudy",
          precipitation: { probability: 40 },
        },
      ])
      setLocation(user?.location || "Your Location")
    } finally {
      setLoading(false)
    }
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="w-8 h-8 text-yellow-500" />
      case "rainy":
      case "rain":
        return <CloudRain className="w-8 h-8 text-blue-500" />
      case "cloudy":
        return <Cloud className="w-8 h-8 text-gray-500" />
      default:
        return <Cloud className="w-8 h-8 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "minor":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "moderate":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "severe":
        return "bg-orange-50 border-orange-200 text-orange-800"
      case "extreme":
        return "bg-red-50 border-red-200 text-red-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  if (loading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </PrivateRoute>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("weatherForecast")}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>
                  {typeof location === "object"
                    ? `${location.name || location.address || location.country || "Your Location"}`
                    : location || "Your Location"}
                </span>
              </div>
            </div>

            {/* Current Weather */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                    {getWeatherIcon(weatherData?.current?.condition || "Partly Cloudy")}
                    <div>
                      <div className="text-5xl font-bold text-gray-900">
                        {weatherData?.current?.temperature || 28}°C
                      </div>
                      <div className="text-lg text-gray-600">{weatherData?.current?.condition || "Partly Cloudy"}</div>
                    </div>
                  </div>
                  <p className="text-gray-500">{t("currentConditions")}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">{t("humidity")}</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{weatherData?.current?.humidity || 65}%</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="w-5 h-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">{t("windSpeed")}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-600">{weatherData?.current?.windSpeed || 12} km/h</div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium text-gray-700">{t("pressure")}</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600">
                      {weatherData?.current?.pressure || 1013} hPa
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">{t("visibility")}</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{weatherData?.current?.visibility || 10} km</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Alerts */}
            {weatherData?.alerts && weatherData.alerts.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t("weatherAlerts")}</h2>
                <div className="space-y-4">
                  {weatherData.alerts.map((alert: any, index: number) => (
                    <div key={index} className={`rounded-lg border p-4 ${getSeverityColor(alert.severity)}`}>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{alert.title}</h3>
                            <span className="text-xs px-2 py-1 bg-white/50 rounded-full">{alert.severity}</span>
                          </div>
                          <p className="text-sm mb-2">{alert.description}</p>
                          <div className="text-xs opacity-75">
                            {new Date(alert.startTime).toLocaleDateString()} -{" "}
                            {new Date(alert.endTime).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5-Day Forecast */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">{t("fiveDayForecast")}</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {forecast.map((day, index) => (
                    <div key={index} className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-sm font-medium text-gray-600 mb-2">
                        {index === 0 ? t("today") : new Date(day.date).toLocaleDateString("en", { weekday: "short" })}
                      </div>
                      <div className="flex justify-center mb-3">{getWeatherIcon(day.condition)}</div>
                      <div className="text-sm text-gray-600 mb-2">{day.condition}</div>
                      <div className="font-semibold text-gray-900">
                        {day.temperature.max}° / {day.temperature.min}°
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {day.precipitation.probability}% {t("rain")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Farming Recommendations */}
            <div className="mt-8 bg-green-50 rounded-xl border border-green-200 p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">{t("farmingRecommendations")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">{t("irrigation")}</h3>
                  <p className="text-sm text-green-700">
                    {weatherData?.current?.humidity > 70 ? t("reduceIrrigation") : t("normalIrrigation")}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">{t("cropProtection")}</h3>
                  <p className="text-sm text-green-700">
                    {forecast[1]?.precipitation?.probability > 60 ? t("protectFromRain") : t("normalProtection")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}
