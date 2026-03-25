"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import PrivateRoute from "../components/PrivateRoute"
import Navbar from "../components/Navbar"
import Link from "next/link"
import { Plus, BookOpen, Calendar, TrendingUp, DollarSign, Activity, Search, Download, Eye, Edit } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

interface CropDiary {
  _id: string
  crop: {
    name: string
    variety: string
    season: string
  }
  farm: {
    _id: string
    name: string
    location: {
      address: string
    }
  }
  plantingDate: string
  expectedHarvestDate?: string
  actualHarvestDate?: string
  area: {
    value: number
    unit: string
  }
  status: string
  currentStage?: {
    name: string
    status: string
  }
  daysSincePlanting: number
  totalActivities: number
  economics: {
    totalInvestment: number
    totalRevenue: number
    profit: number
    roi: number
  }
  yield: {
    expected?: {
      quantity: number
      unit: string
    }
    actual?: {
      quantity: number
      unit: string
      quality: string
    }
  }
  createdAt: string
}

interface DashboardSummary {
  activeDiaries: number
  completedDiaries: number
  totalInvestment: number
  totalRevenue: number
  profit: number
  activeCrops: CropDiary[]
  recentActivities: Array<{
    cropName: string
    activityType: string
    description: string
    date: string
    cost: number
  }>
}

const DUMMY_DIARIES: CropDiary[] = [
  {
    _id: "1",
    crop: { name: "Wheat", variety: "HD2733", season: "rabi" },
    farm: { _id: "farm1", name: "North Field", location: { address: "Punjab" } },
    plantingDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    expectedHarvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    area: { value: 5, unit: "hectares" },
    status: "active",
    currentStage: { name: "vegetative-growth", status: "ongoing" },
    daysSincePlanting: 60,
    totalActivities: 8,
    economics: { totalInvestment: 25000, totalRevenue: 0, profit: -25000, roi: 0 },
    yield: { expected: { quantity: 50, unit: "quintal" } },
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "2",
    crop: { name: "Rice", variety: "Basmati", season: "kharif" },
    farm: { _id: "farm2", name: "South Field", location: { address: "Bihar" } },
    plantingDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    actualHarvestDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    area: { value: 3, unit: "hectares" },
    status: "completed",
    currentStage: { name: "harvesting", status: "completed" },
    daysSincePlanting: 150,
    totalActivities: 15,
    economics: { totalInvestment: 18000, totalRevenue: 42000, profit: 24000, roi: 133.3 },
    yield: {
      expected: { quantity: 40, unit: "quintal" },
      actual: { quantity: 42, unit: "quintal", quality: "premium" },
    },
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "3",
    crop: { name: "Maize", variety: "DHM117", season: "kharif" },
    farm: { _id: "farm1", name: "North Field", location: { address: "Punjab" } },
    plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    area: { value: 2, unit: "hectares" },
    status: "active",
    currentStage: { name: "flowering", status: "ongoing" },
    daysSincePlanting: 45,
    totalActivities: 6,
    economics: { totalInvestment: 12000, totalRevenue: 0, profit: -12000, roi: 0 },
    yield: { expected: { quantity: 35, unit: "quintal" } },
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export default function CropDiary() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [diaries, setDiaries] = useState<CropDiary[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: "all",
    crop: "",
    season: "",
    search: "",
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      setDiaries(DUMMY_DIARIES)

      // Calculate summary from dummy data
      const activeDiaries = DUMMY_DIARIES.filter((d) => d.status === "active").length
      const completedDiaries = DUMMY_DIARIES.filter((d) => d.status === "completed").length
      const totalInvestment = DUMMY_DIARIES.reduce((sum, d) => sum + d.economics.totalInvestment, 0)
      const totalRevenue = DUMMY_DIARIES.reduce((sum, d) => sum + d.economics.totalRevenue, 0)
      const profit = totalRevenue - totalInvestment

      setSummary({
        activeDiaries,
        completedDiaries,
        totalInvestment,
        totalRevenue,
        profit,
        activeCrops: DUMMY_DIARIES,
        recentActivities: [],
      })
    } catch (error) {
      console.error("Error setting crop diary data:", error)
      // Fallback to dummy data on any error
      setDiaries(DUMMY_DIARIES)
      setSummary({
        activeDiaries: 2,
        completedDiaries: 1,
        totalInvestment: 55000,
        totalRevenue: 42000,
        profit: -13000,
        activeCrops: DUMMY_DIARIES,
        recentActivities: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportDiary = async (diaryId: string) => {
    try {
      const response = await axios.get(`/api/crop-diary/${diaryId}/export`)

      // Create and download CSV file
      const csvContent = convertToCSV(response.data.data)
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `crop-diary-${diaryId}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Crop diary exported successfully")
    } catch (error) {
      console.error("Error exporting diary:", error)
      toast.error("Failed to export crop diary")
    }
  }

  const convertToCSV = (data: any) => {
    const { cropInfo, activities, economics } = data

    let csv = "Crop Diary Export\n\n"

    // Crop Information
    csv += "Crop Information\n"
    Object.entries(cropInfo).forEach(([key, value]) => {
      csv += `${key},${value}\n`
    })

    csv += "\nActivities\n"
    csv += "Date,Type,Description,Cost,Weather,Notes\n"
    activities.forEach((activity: any) => {
      csv += `${activity.Date},${activity.Type},"${activity.Description}",${activity.Cost},${activity.Weather},"${activity.Notes}"\n`
    })

    csv += "\nEconomics\n"
    Object.entries(economics).forEach(([key, value]) => {
      if (typeof value === "object") {
        csv += `${key}\n`
        Object.entries(value as any).forEach(([subKey, subValue]) => {
          csv += `  ${subKey},${subValue}\n`
        })
      } else {
        csv += `${key},${value}\n`
      }
    })

    return csv
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100"
      case "completed":
        return "text-blue-600 bg-blue-100"
      case "abandoned":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "land-preparation":
        return "text-brown-600 bg-brown-100"
      case "sowing":
        return "text-green-600 bg-green-100"
      case "germination":
        return "text-emerald-600 bg-emerald-100"
      case "vegetative-growth":
        return "text-lime-600 bg-lime-100"
      case "flowering":
        return "text-pink-600 bg-pink-100"
      case "fruit-development":
        return "text-orange-600 bg-orange-100"
      case "maturation":
        return "text-yellow-600 bg-yellow-100"
      case "harvesting":
        return "text-purple-600 bg-purple-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Diary</h1>
                <p className="text-gray-600">Track your crop activities, expenses, and harvest data</p>
              </div>
              <Link
                href="/crop-diary/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                New Crop Diary
              </Link>
            </div>

            {/* Dashboard Summary */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Diaries</p>
                      <p className="text-3xl font-bold text-gray-900">{summary.activeDiaries}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-3xl font-bold text-gray-900">{summary.completedDiaries}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Investment</p>
                      <p className="text-3xl font-bold text-gray-900">₹{summary.totalInvestment.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Revenue</p>
                      <p className="text-3xl font-bold text-gray-900">₹{summary.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Profit</p>
                      <p className={`text-3xl font-bold ${summary.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ₹{summary.profit.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        summary.profit >= 0 ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <Activity className={`w-6 h-6 ${summary.profit >= 0 ? "text-green-600" : "text-red-600"}`} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search crop diaries..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
                <select
                  value={filters.season}
                  onChange={(e) => setFilters({ ...filters, season: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Seasons</option>
                  <option value="kharif">Kharif</option>
                  <option value="rabi">Rabi</option>
                  <option value="zaid">Zaid</option>
                  <option value="perennial">Perennial</option>
                </select>
                <input
                  type="text"
                  placeholder="Crop name..."
                  value={filters.crop}
                  onChange={(e) => setFilters({ ...filters, crop: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Crop Diaries Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : diaries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {diaries.map((diary) => (
                  <div
                    key={diary._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{diary.crop.name}</h3>
                          <p className="text-sm text-gray-600">
                            {diary.crop.variety} • {diary.crop.season}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(diary.status)}`}
                          >
                            {diary.status}
                          </span>
                          {diary.currentStage && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(diary.currentStage.name)}`}
                            >
                              {diary.currentStage.name.replace("-", " ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Farm Info */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Farm:</strong> {diary.farm.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Area:</strong> {diary.area.value} {diary.area.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Days:</strong> {diary.daysSincePlanting} since planting
                        </p>
                      </div>

                      {/* Economics */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Investment</p>
                          <p className="text-sm font-semibold text-red-600">
                            ₹{diary.economics.totalInvestment.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500">Revenue</p>
                          <p className="text-sm font-semibold text-green-600">
                            ₹{diary.economics.totalRevenue.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* ROI */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">ROI</span>
                          <span
                            className={`text-sm font-semibold ${
                              diary.economics.roi >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {diary.economics.roi.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Activities */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Activities:</strong> {diary.totalActivities}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Planted:</strong> {new Date(diary.plantingDate).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/crop-diary/${diary._id}`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                          <Link
                            href={`/crop-diary/${diary._id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </div>
                        <button
                          onClick={() => handleExportDiary(diary._id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No crop diaries found</h3>
                <p className="text-gray-600 mb-6">
                  {filters.search || filters.crop || filters.status !== "all" || filters.season
                    ? "Try adjusting your search criteria"
                    : "Start tracking your crops by creating your first crop diary"}
                </p>
                {!filters.search && !filters.crop && filters.status === "all" && !filters.season && (
                  <Link
                    href="/crop-diary/create"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Crop Diary
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}
