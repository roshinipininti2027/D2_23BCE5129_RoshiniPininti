"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import { useLanguage } from "../../contexts/LanguageContext"
import PrivateRoute from "../../components/PrivateRoute"
import Navbar from "../../components/Navbar"
import { ArrowLeft, Save, Calendar, Sprout, FileText, Camera } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import Link from "next/link"

export default function CreateCropDiary() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const router = useRouter()

  const [farms, setFarms] = useState<any[]>([])
  const [formData, setFormData] = useState({
    farmId: "",
    cropName: "",
    variety: "",
    plantingDate: "",
    expectedHarvestDate: "",
    area: "",
    activityType: "",
    description: "",
    notes: "",
    images: [] as File[],
    weather: {
      temperature: "",
      humidity: "",
      rainfall: "",
    },
    inputs: {
      fertilizer: "",
      pesticide: "",
      seeds: "",
      water: "",
    },
  })

  const [loading, setLoading] = useState(false)

  const activityTypes = [
    "Land Preparation",
    "Sowing/Planting",
    "Irrigation",
    "Fertilization",
    "Pest Control",
    "Weeding",
    "Harvesting",
    "Post-Harvest",
    "Monitoring",
    "Other",
  ]

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
        { _id: "1", name: "Green Valley Farm", location: "Punjab, India" },
        { _id: "2", name: "Sunrise Organic Farm", location: "Haryana, India" },
      ])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData({
        ...formData,
        [parent]: {
          ...(formData[parent as keyof typeof formData] as any),
          [child]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        images: Array.from(e.target.files),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const cropDiaryData = new FormData()

      Object.keys(formData).forEach((key) => {
        if (key === "images") {
          formData.images.forEach((image) => {
            cropDiaryData.append("images", image)
          })
        } else if (key === "weather" || key === "inputs") {
          cropDiaryData.append(key, JSON.stringify(formData[key as keyof typeof formData]))
        } else {
          cropDiaryData.append(key, formData[key as keyof typeof formData] as string)
        }
      })

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Authentication required. Please log in again.")
        router.push("/login")
        return
      }

      const response = await axios.post("/api/crop-diary", cropDiaryData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data) {
        toast.success("Crop diary entry created successfully!")
        router.push("/crop-diary")
      }
    } catch (error: any) {
      console.error("Error creating crop diary:", error)
      if (error.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.")
        router.push("/login")
      } else {
        toast.error(error.response?.data?.message || "Error creating crop diary entry")
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
            <div className="flex items-center gap-4 mb-8 slide-in-animation">
              <Link
                href="/crop-diary"
                className="p-2 text-slate-300 hover:text-green-400 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold gradient-text mb-2">Create Crop Diary Entry</h1>
                <p className="text-slate-300">Record your farming activities and observations</p>
              </div>
            </div>

            <div className="glass-card p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-green-600" />
                    Basic Information
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="farmId" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Farm *
                      </label>
                      <select
                        id="farmId"
                        name="farmId"
                        value={formData.farmId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Choose a farm</option>
                        {farms.map((farm) => (
                          <option key={farm._id} value={farm._id}>
                            {farm.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="cropName" className="block text-sm font-medium text-gray-700 mb-2">
                        Crop Name *
                      </label>
                      <select
                        id="cropName"
                        name="cropName"
                        value={formData.cropName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select crop</option>
                        {commonCrops.map((crop) => (
                          <option key={crop} value={crop}>
                            {crop}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-2">
                        Variety
                      </label>
                      <input
                        type="text"
                        id="variety"
                        name="variety"
                        value={formData.variety}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="e.g., Basmati, HD-2967"
                      />
                    </div>

                    <div>
                      <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                        Area (acres)
                      </label>
                      <input
                        type="number"
                        id="area"
                        name="area"
                        value={formData.area}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="5.5"
                      />
                    </div>

                    <div>
                      <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Planting Date
                      </label>
                      <input
                        type="date"
                        id="plantingDate"
                        name="plantingDate"
                        value={formData.plantingDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="expectedHarvestDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Harvest Date
                      </label>
                      <input
                        type="date"
                        id="expectedHarvestDate"
                        name="expectedHarvestDate"
                        value={formData.expectedHarvestDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Activity Details
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label htmlFor="activityType" className="block text-sm font-medium text-gray-700 mb-2">
                        Activity Type *
                      </label>
                      <select
                        id="activityType"
                        name="activityType"
                        value={formData.activityType}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select activity type</option>
                        {activityTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Describe the activity performed..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Any additional observations or notes..."
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Weather Conditions
                  </h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label htmlFor="weather.temperature" className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature (°C)
                      </label>
                      <input
                        type="number"
                        id="weather.temperature"
                        name="weather.temperature"
                        value={formData.weather.temperature}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="25"
                      />
                    </div>

                    <div>
                      <label htmlFor="weather.humidity" className="block text-sm font-medium text-gray-700 mb-2">
                        Humidity (%)
                      </label>
                      <input
                        type="number"
                        id="weather.humidity"
                        name="weather.humidity"
                        value={formData.weather.humidity}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="65"
                      />
                    </div>

                    <div>
                      <label htmlFor="weather.rainfall" className="block text-sm font-medium text-gray-700 mb-2">
                        Rainfall (mm)
                      </label>
                      <input
                        type="number"
                        id="weather.rainfall"
                        name="weather.rainfall"
                        value={formData.weather.rainfall}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    Inputs Used
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="inputs.fertilizer" className="block text-sm font-medium text-gray-700 mb-2">
                        Fertilizer
                      </label>
                      <input
                        type="text"
                        id="inputs.fertilizer"
                        name="inputs.fertilizer"
                        value={formData.inputs.fertilizer}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="NPK 10-26-26, 50kg"
                      />
                    </div>

                    <div>
                      <label htmlFor="inputs.pesticide" className="block text-sm font-medium text-gray-700 mb-2">
                        Pesticide/Herbicide
                      </label>
                      <input
                        type="text"
                        id="inputs.pesticide"
                        name="inputs.pesticide"
                        value={formData.inputs.pesticide}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Glyphosate, 2L"
                      />
                    </div>

                    <div>
                      <label htmlFor="inputs.seeds" className="block text-sm font-medium text-gray-700 mb-2">
                        Seeds
                      </label>
                      <input
                        type="text"
                        id="inputs.seeds"
                        name="inputs.seeds"
                        value={formData.inputs.seeds}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="Basmati seeds, 25kg"
                      />
                    </div>

                    <div>
                      <label htmlFor="inputs.water" className="block text-sm font-medium text-gray-700 mb-2">
                        Water (hours/liters)
                      </label>
                      <input
                        type="text"
                        id="inputs.water"
                        name="inputs.water"
                        value={formData.inputs.water}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                        placeholder="4 hours irrigation"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-orange-600" />
                    Images
                  </h2>

                  <div>
                    <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Photos
                    </label>
                    <input
                      type="file"
                      id="images"
                      name="images"
                      onChange={handleImageChange}
                      multiple
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Upload photos of your crops, activities, or observations (max 5 images)
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-slate-700">
                  <Link
                    href="/crop-diary"
                    className="px-6 py-3 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700/50 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 glow-effect"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "Creating..." : "Create Entry"}
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
