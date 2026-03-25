"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import PrivateRoute from "../../components/PrivateRoute"
import Navbar from "../../components/Navbar"
import LocationInput from "../../components/LocationInput"
import { ArrowLeft, Save, Ruler, Sprout, Tractor, Home, Zap } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import Link from "next/link"

export default function CreateFarm() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    coordinates: [0, 0],
    area: {
      value: "",
      unit: "acres",
    },
    soilType: "",
    irrigationType: "",
    description: "",
    crops: [],
    machinery: [],
    facilities: [],
  })

  const [loading, setLoading] = useState(false)

  const soilTypes = ["Clay", "Sandy", "Loamy", "Silty", "Peaty", "Chalky"]

  const irrigationTypes = ["Drip", "Sprinkler", "Flood", "Furrow", "Center Pivot", "Manual"]

  const commonCrops = [
    "Rice",
    "Wheat",
    "Corn",
    "Sugarcane",
    "Cotton",
    "Soybean",
    "Tomato",
    "Potato",
    "Onion",
    "Cabbage",
    "Carrot",
    "Beans",
    "Mango",
    "Banana",
    "Apple",
    "Orange",
    "Grapes",
    "Coconut",
  ]

  const commonMachinery = [
    "Tractor",
    "Harvester",
    "Plough",
    "Cultivator",
    "Seeder",
    "Sprayer",
    "Thresher",
    "Irrigation Pump",
    "Disc Harrow",
  ]

  const commonFacilities = [
    "Storage Warehouse",
    "Processing Unit",
    "Cold Storage",
    "Greenhouse",
    "Livestock Shed",
    "Equipment Shed",
    "Office Building",
    "Worker Quarters",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "area") {
      setFormData({
        ...formData,
        area: { ...formData.area, value },
      })
    } else if (name === "areaUnit") {
      setFormData({
        ...formData,
        area: { ...formData.area, unit: value },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleLocationChange = (location: string) => {
    setFormData({
      ...formData,
      location,
    })
  }

  const handleArrayChange = (field: string, value: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]

    setFormData({
      ...formData,
      [field]: newArray,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const farmData = {
        ...formData,
        area: {
          value: Number.parseFloat(formData.area.value),
          unit: formData.area.unit,
        },
      }

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Authentication required. Please log in again.")
        router.push("/login")
        return
      }

      const response = await axios.post("/api/farms", farmData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data) {
        toast.success(t("farmCreatedSuccessfully"))
        router.push("/farms")
      }
    } catch (error: any) {
      console.error("Error creating farm:", error)
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.")
        router.push("/login")
      } else {
        toast.error(error.response?.data?.message || t("errorCreatingFarm"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen hero-section relative overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-primary opacity-20 rounded-full blur-3xl float-animation"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-secondary opacity-20 rounded-full blur-3xl float-animation"
          style={{ animationDelay: "1s" }}
        ></div>

        <Navbar />

        <div className="pt-20 pb-8 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8 slide-in-animation">
              <Link
                href="/farms"
                className="p-2 text-slate-300 hover:text-green-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">{t("createNewFarm")}</h1>
                <p className="text-slate-300">{t("addFarmDetails")}</p>
              </div>
            </div>

            {/* Form */}
            <div className="glass-card p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Home className="w-5 h-5 text-green-600" />
                    {t("basicInformation")}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("farmName")} *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder={t("enterFarmName")}
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("location")} *
                      </label>
                      <LocationInput
                        value={formData.location}
                        onChange={handleLocationChange}
                        placeholder={t("enterFarmLocation")}
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("description")}
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      placeholder={t("describeFarm")}
                    />
                  </div>
                </div>

                {/* Farm Specifications */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-green-600" />
                    {t("farmSpecifications")}
                  </h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("farmArea")} *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          id="area"
                          name="area"
                          value={formData.area.value}
                          onChange={handleChange}
                          required
                          min="0"
                          step="0.1"
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          placeholder="25"
                        />
                        <select
                          name="areaUnit"
                          value={formData.area.unit}
                          onChange={handleChange}
                          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        >
                          <option value="acres">{t("acres")}</option>
                          <option value="hectares">{t("hectares")}</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="soilType" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("soilType")} *
                      </label>
                      <select
                        id="soilType"
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      >
                        <option value="">{t("selectSoilType")}</option>
                        {soilTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="irrigationType" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("irrigationType")} *
                      </label>
                      <select
                        id="irrigationType"
                        name="irrigationType"
                        value={formData.irrigationType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      >
                        <option value="">{t("selectIrrigationType")}</option>
                        {irrigationTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Crops */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-green-600" />
                    {t("crops")}
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {commonCrops.map((crop) => (
                      <label
                        key={crop}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.crops.includes(crop)}
                          onChange={() => handleArrayChange("crops", crop)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{crop}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Machinery */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Tractor className="w-5 h-5 text-green-600" />
                    {t("machinery")}
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {commonMachinery.map((machine) => (
                      <label
                        key={machine}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.machinery.includes(machine)}
                          onChange={() => handleArrayChange("machinery", machine)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{machine}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    {t("facilities")}
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {commonFacilities.map((facility) => (
                      <label
                        key={facility}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleArrayChange("facilities", facility)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-slate-700">
                  <Link
                    href="/farms"
                    className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    {t("cancel")}
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-effect"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? t("creating") : t("createFarm")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}
