"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import PrivateRoute from "../components/PrivateRoute"
import Navbar from "../components/Navbar"
import Link from "next/link"
import { Plus, MapPin, Calendar, Droplets, BarChart3, Edit, Trash2, Eye, Sprout } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"

export default function Farms() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [farms, setFarms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFarms()
  }, [])

  const fetchFarms = async () => {
    try {
      const response = await axios.get("/api/farms")
      setFarms(response.data)
    } catch (error) {
      console.error("Error fetching farms:", error)
      // Mock data for demonstration
      setFarms([
        {
          _id: "1",
          name: "Green Valley Farm",
          location: { address: "Punjab", district: "Mohali", state: "India" },
          area: 25,
          soilType: "Loamy",
          irrigationType: "Drip",
          crops: [
            { cropName: "Rice", variety: "Basmati", status: "Growing" },
            { cropName: "Wheat", variety: "HD-2967", status: "Planted" },
          ],
          createdAt: new Date(),
        },
        {
          _id: "2",
          name: "Sunrise Organic Farm",
          location: "Haryana, India",
          area: 15,
          soilType: "Sandy",
          irrigationType: "Sprinkler",
          crops: [{ cropName: "Corn", variety: "Sweet Corn", status: "Growing" }],
          createdAt: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const deleteFarm = async (farmId: string) => {
    if (!confirm(t("confirmDeleteFarm"))) return

    try {
      await axios.delete(`/api/farms/${farmId}`)
      setFarms(farms.filter((farm) => farm._id !== farmId))
      toast.success(t("farmDeletedSuccessfully"))
    } catch (error) {
      console.error("Error deleting farm:", error)
      toast.error(t("errorDeletingFarm"))
    }
  }

  const getSoilTypeColor = (soilType: string) => {
    const colors = {
      Clay: "bg-orange-100 text-orange-800",
      Sandy: "bg-yellow-100 text-yellow-800",
      Loamy: "bg-green-100 text-green-800",
      Silty: "bg-blue-100 text-blue-800",
      Peaty: "bg-purple-100 text-purple-800",
      Chalky: "bg-gray-100 text-gray-800",
    }
    return colors[soilType as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getIrrigationIcon = (type: string) => {
    switch (type) {
      case "Drip":
        return <Droplets className="w-4 h-4" />
      case "Sprinkler":
        return <Droplets className="w-4 h-4" />
      default:
        return <Droplets className="w-4 h-4" />
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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("myFarms")}</h1>
                <p className="text-gray-600">{t("manageFarmsDescription")}</p>
              </div>
              <Link
                href="/farms/create"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                {t("addNewFarm")}
              </Link>
            </div>

            {/* Farms Grid */}
            {farms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farms.map((farm) => (
                  <div
                    key={farm._id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">{farm.name}</h3>
                          <div className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">
                              {typeof farm.location === "object" && farm.location !== null
                                ? `${farm.location.address || farm.location.district || farm.location.state || "Unknown Location"}`
                                : typeof farm.location === "string"
                                  ? farm.location
                                  : "Unknown Location"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/farms/${farm._id}`}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title={t("viewFarm")}
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/farms/${farm._id}/edit`}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t("editFarm")}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => deleteFarm(farm._id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t("deleteFarm")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t("area")}</span>
                          <div className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                              {farm.area} {t("acres")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t("soilType")}</span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getSoilTypeColor(farm.soilType)}`}
                          >
                            {farm.soilType}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t("irrigation")}</span>
                          <div className="flex items-center gap-1">
                            {getIrrigationIcon(farm.irrigationType)}
                            <span className="text-sm font-medium">{farm.irrigationType}</span>
                          </div>
                        </div>
                      </div>

                      {/* Crops */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{t("activeCrops")}</span>
                          <span className="text-sm text-gray-500">{farm.crops?.length || 0}</span>
                        </div>

                        {farm.crops && farm.crops.length > 0 ? (
                          <div className="space-y-2">
                            {farm.crops.slice(0, 2).map((crop: any, index: number) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Sprout className="w-3 h-3 text-green-500" />
                                <span className="text-gray-700">{crop.cropName}</span>
                                <span className="text-gray-500">({crop.variety})</span>
                                <span
                                  className={`ml-auto px-2 py-0.5 rounded-full text-xs ${
                                    crop.status === "Growing"
                                      ? "bg-green-100 text-green-800"
                                      : crop.status === "Planted"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {crop.status}
                                </span>
                              </div>
                            ))}
                            {farm.crops.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{farm.crops.length - 2} {t("moreCrops")}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-2">{t("noCropsPlanted")}</div>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {t("created")} {new Date(farm.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Sprout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t("noFarmsYet")}</h3>
                <p className="text-gray-600 mb-6">{t("createFirstFarm")}</p>
                <Link
                  href="/farms/create"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  {t("createYourFirstFarm")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}
