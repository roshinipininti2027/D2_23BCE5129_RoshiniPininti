"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import PrivateRoute from "../components/PrivateRoute"
import Navbar from "../components/Navbar"
import {
  Sprout,
  TrendingUp,
  Cloud,
  AlertTriangle,
  Droplets,
  Wind,
  Activity,
  BarChart3,
  Users,
  Plus,
  MessageSquare,
  Bell,
  BookOpen,
  UserCheck,
  Eye,
  MapPin,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import axios from "axios"
import Link from "next/link"

export default function Dashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [weatherData, setWeatherData] = useState<any>(null)
  const [farmStats, setFarmStats] = useState<any>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [queries, setQueries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (user?.role === "farmer") {
        const [weatherRes, farmsRes, activitiesRes, notificationsRes] = await Promise.all([
          axios.get("/api/weather/current"),
          axios.get("/api/farms"),
          axios.get("/api/activities?limit=5"),
          axios.get("/api/notifications?limit=5"),
        ])

        setWeatherData(weatherRes.data)
        setFarmStats({
          totalFarms: farmsRes.data.length,
          totalArea: farmsRes.data.reduce((sum: number, farm: any) => sum + farm.area, 0),
          activeCrops: farmsRes.data.reduce((sum: number, farm: any) => sum + farm.crops.length, 0),
        })
        setRecentActivities(activitiesRes.data)
        setNotifications(notificationsRes.data)
      } else if (user?.role === "expert") {
        const [queriesRes, notificationsRes] = await Promise.all([
          axios.get("/api/consultations/expert?status=open&limit=5"),
          axios.get("/api/notifications?limit=5"),
        ])

        setQueries(queriesRes.data.consultations || [])
        setNotifications(notificationsRes.data)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      // Mock data for demonstration
      if (user?.role === "farmer") {
        setWeatherData({
          current: { temperature: 28, condition: "Partly Cloudy", humidity: 65, windSpeed: 12 },
        })
        setFarmStats({ totalFarms: 2, totalArea: 15, activeCrops: 8 })
        setRecentActivities([])
        setNotifications([])
      } else if (user?.role === "expert") {
        setQueries([
          {
            _id: "1",
            title: "Pest Control for Rice Crop",
            description: "My rice crop is showing signs of pest damage. What should I do?",
            farmer: { name: "Rajesh Kumar", location: { address: "Punjab, India" } },
            createdAt: new Date(),
            status: "open",
          },
          {
            _id: "2",
            title: "Soil pH Management",
            description: "How can I improve soil pH for better wheat yield?",
            farmer: { name: "Suresh Patel", location: { address: "Gujarat, India" } },
            createdAt: new Date(),
            status: "open",
          },
        ])
        setNotifications([])
      }
    } finally {
      setLoading(false)
    }
  }

  const yieldData = [
    { month: "Jan", yield: 2400 },
    { month: "Feb", yield: 1398 },
    { month: "Mar", yield: 9800 },
    { month: "Apr", yield: 3908 },
    { month: "May", yield: 4800 },
    { month: "Jun", yield: 3800 },
  ]

  const cropData = [
    { name: "Rice", area: 45 },
    { name: "Wheat", area: 30 },
    { name: "Corn", area: 25 },
    { name: "Vegetables", area: 15 },
  ]

  if (loading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </PrivateRoute>
    )
  }

  if (user?.role === "expert") {
    return (
      <PrivateRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          <div className="pt-20 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t("welcome")}, Dr. {user?.name}!
                </h1>
                <p className="text-gray-600">Agricultural Expert Dashboard - Help farmers grow better</p>
              </div>

              {/* Quick Actions for Experts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link
                  href="/advisor"
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Open Queries</p>
                      <p className="text-2xl font-bold text-blue-600">{queries.length}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-blue-600" />
                  </div>
                </Link>

                <Link
                  href="/chatbot"
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">AI Assistant</p>
                      <p className="text-lg font-bold text-green-600">Available</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-green-600" />
                  </div>
                </Link>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Notifications</p>
                      <p className="text-2xl font-bold text-orange-600">{notifications.length}</p>
                    </div>
                    <Bell className="w-8 h-8 text-orange-600" />
                  </div>
                </div>

                
              </div>

              {/* Recent Queries */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Farmer Queries</h2>
                    <Link href="/advisor" className="text-green-600 hover:text-green-700 font-medium text-sm">
                      View All
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {queries.length > 0 ? (
                    <div className="space-y-4">
                      {queries.slice(0, 3).map((query: any, index: number) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 mb-1">{query.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{query.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {query.farmer?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {typeof query.farmer?.location === "object" && query.farmer?.location !== null
                                  ? query.farmer.location.address || "Unknown Location"
                                  : query.farmer?.location || "Unknown Location"}
                              </span>
                              <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Link
                            href="/advisor"
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Respond
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No recent queries</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("welcome")}, {user?.name}!
              </h1>
              <p className="text-gray-600">{t("dashboardSubtitle")}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              <Link
                href="/farms"
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center"
              >
                <Sprout className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{t("myFarms")}</p>
              </Link>

              <Link
                href="/crop-diary"
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center"
              >
                <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{t("cropDiary")}</p>
              </Link>

              <Link
                href="/weather"
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center"
              >
                <Cloud className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{t("weather")}</p>
              </Link>

              <Link
                href="/analytics"
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center"
              >
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{t("analytics")}</p>
              </Link>

              <Link
                href="/expert-connect"
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center"
              >
                <UserCheck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{t("askExpert")}</p>
              </Link>

              <Link
                href="/chatbot"
                className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 hover:shadow-lg transition-shadow duration-200 text-center"
              >
                <MessageSquare className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">{t("aiAssistant")}</p>
              </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("totalFarms")}</p>
                    <p className="text-3xl font-bold text-gray-900">{farmStats?.totalFarms || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("totalArea")}</p>
                    <p className="text-3xl font-bold text-gray-900">{farmStats?.totalArea || 0}</p>
                    <p className="text-xs text-gray-500">{t("acres")}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("activeCrops")}</p>
                    <p className="text-3xl font-bold text-gray-900">{farmStats?.activeCrops || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("healthScore")}</p>
                    <p className="text-3xl font-bold text-gray-900">92%</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Weather Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">{t("currentWeather")}</h2>
                    <Link href="/weather" className="text-green-600 hover:text-green-700">
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>

                  {weatherData ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {weatherData.current?.temperature || 28}°C
                        </div>
                        <p className="text-gray-600">{weatherData.current?.condition || "Partly Cloudy"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="text-xs text-gray-500">{t("humidity")}</p>
                            <p className="font-semibold">{weatherData.current?.humidity || 65}%</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">{t("windSpeed")}</p>
                            <p className="font-semibold">{weatherData.current?.windSpeed || 12} km/h</p>
                          </div>
                        </div>
                      </div>

                      {weatherData.alerts && weatherData.alerts.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <p className="text-sm text-yellow-800">{weatherData.alerts[0].description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">{t("loadingWeather")}</p>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    <Bell className="w-5 h-5 text-gray-400" />
                  </div>
                  {notifications.length > 0 ? (
                    <div className="space-y-3">
                      {notifications.slice(0, 3).map((notification: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                          <Bell className="w-4 h-4 text-orange-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500">{notification.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No new notifications</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Charts */}
              <div className="lg:col-span-2 space-y-6">
                {/* Yield Trend */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("yieldTrend")}</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={yieldData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Crop Distribution */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("cropDistribution")}</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={cropData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="area" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">{t("recentActivities")}</h2>
                </div>
                <div className="p-6">
                  {recentActivities.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Activity className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.description}</p>
                            <p className="text-sm text-gray-500">
                              {activity.farm?.name} • {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">{activity.activityType}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">{t("noRecentActivities")}</p>
                      <Link
                        href="/crop-diary"
                        className="inline-flex items-center gap-2 mt-4 text-green-600 hover:text-green-700 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add Farm Activity
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}
