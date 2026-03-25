"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useAuth } from "../../contexts/AuthContext"
import PrivateRoute from "../../components/PrivateRoute"
import Navbar from "../../components/Navbar"
import {
  ArrowLeft,
  Leaf,
  DollarSign,
  TrendingUp,
  Calendar,
  MapPin,
  Droplet,
  Wind,
  Thermometer,
  Activity,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const dummyCropDiaries: any = {
  "1": {
    _id: "1",
    crop: { name: "Basmati Rice", variety: "Pusa Basmati 1121", season: "Kharif" },
    farm: { _id: "f1", name: "Green Valley Farm", location: { address: "Punjab, India" }, area: 25 },
    plantingDate: "2024-06-15",
    expectedHarvestDate: "2024-11-15",
    area: { value: 5.2, unit: "acres" },
    status: "active",
    currentStage: { name: "flowering", status: "healthy" },
    daysSincePlanting: 95,
    totalActivities: 12,
    economics: {
      totalInvestment: 85000,
      totalRevenue: 125000,
      profit: 40000,
      roi: 47.1,
      costPerUnit: 3269,
      pricePerUnit: 4808,
    },
    yield: { expected: { quantity: 26, unit: "quintals" } },
    createdAt: "2024-06-15",
    soilHealth: {
      ph: 7.2,
      nitrogen: 240,
      phosphorus: 35,
      potassium: 280,
      organicMatter: 2.8,
    },
    weatherConditions: {
      avgTemp: 28.5,
      avgHumidity: 75,
      rainfall: 450,
      sunlight: "8-10 hours",
    },
    activities: [
      { date: "2024-06-15", type: "Sowing", description: "Seeds planted at spacing 25cm x 20cm", cost: 8500 },
      {
        date: "2024-07-01",
        type: "First Irrigation",
        description: "Flood irrigation applied after germination",
        cost: 3000,
      },
      { date: "2024-07-20", type: "Weed Control", description: "Manual weeding and first chemical spray", cost: 4200 },
      {
        date: "2024-08-10",
        type: "Fertilizer Application",
        description: "NPK 10:26:26 applied for vegetative growth",
        cost: 8500,
      },
      {
        date: "2024-09-01",
        type: "Pest Management",
        description: "Organic pesticide spray for leaf folder control",
        cost: 6500,
      },
      {
        date: "2024-09-25",
        type: "Flowering Stage Boost",
        description: "NPK 0:52:34 applied for flower development",
        cost: 9200,
      },
    ],
    monthlyProgress: [
      { month: "Jun", area: 5.2, investment: 12000 },
      { month: "Jul", area: 5.2, investment: 18500 },
      { month: "Aug", area: 5.2, investment: 27000 },
      { month: "Sep", area: 5.2, investment: 39000 },
      { month: "Oct", area: 5.2, investment: 50000 },
    ],
    costBreakdown: [
      { name: "Seeds", value: 15000 },
      { name: "Fertilizers", value: 35000 },
      { name: "Labour", value: 18000 },
      { name: "Irrigation", value: 12000 },
      { name: "Pesticides", value: 5000 },
    ],
  },
}

export default function CropDiaryDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [diary, setDiary] = useState<any>(dummyCropDiaries[String(id)])
  const [loading, setLoading] = useState(false)

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

  if (loading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </PrivateRoute>
    )
  }

  if (!diary) {
    return (
      <PrivateRoute>
        <Navbar />
        <div className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Crop Diary Not Found</h1>
            <Link href="/crop-diary" className="text-green-400 hover:text-green-300">
              ← Back to Crop Diaries
            </Link>
          </div>
        </div>
      </PrivateRoute>
    )
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/crop-diary"
              className="flex items-center gap-2 text-green-400 hover:text-green-300 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Crop Diaries
            </Link>

            <div className="glass-card p-8 mb-8 slide-in-animation">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold gradient-text mb-2">{diary.crop.name}</h1>
                  <p className="text-slate-300">
                    {diary.crop.variety} • {diary.crop.season} Season • {diary.status.toUpperCase()}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-lg font-semibold text-white ${diary.status === "active" ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-indigo-500"}`}
                >
                  {diary.status === "active" ? "🌱 Active Growth" : "✓ Completed"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-slate-400">Farm Location</p>
                    <p className="font-semibold text-white">{diary.farm.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-slate-400">Area</p>
                    <p className="font-semibold text-white">
                      {diary.area.value} {diary.area.unit}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-slate-400">Days Since Planting</p>
                    <p className="font-semibold text-white">{diary.daysSincePlanting} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-sm text-slate-400">Activities Logged</p>
                    <p className="font-semibold text-white">{diary.totalActivities} entries</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stat-card stat-card-primary float-animation">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Total Investment</p>
                    <p className="text-2xl font-bold text-white">
                      ₹{(diary.economics.totalInvestment / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-white/60">₹{diary.economics.costPerUnit}/unit</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-white/40" />
                </div>
              </div>

              <div className="stat-card stat-card-secondary float-animation" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Expected Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      ₹{(diary.economics.totalRevenue / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-white/60">₹{diary.economics.pricePerUnit}/unit</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-white/40" />
                </div>
              </div>

              <div
                className={`stat-card float-animation ${diary.economics.profit > 0 ? "stat-card-warm" : "bg-gradient-to-r from-red-500 to-pink-500"}`}
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Expected Profit</p>
                    <p className="text-2xl font-bold text-white">₹{(diary.economics.profit / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-white/60">{diary.economics.roi.toFixed(1)}% ROI</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-white/40" />
                </div>
              </div>

              <div className="stat-card stat-card-accent float-animation" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/80">Expected Yield</p>
                    <p className="text-2xl font-bold text-white">
                      {diary.yield.expected.quantity} {diary.yield.expected.unit}
                    </p>
                    <p className="text-xs text-white/60">Per {diary.area.unit}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-white/40" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="glass-card p-6 slide-in-animation">
                <h2 className="text-2xl font-bold gradient-text mb-6">Investment Breakdown</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={diary.costBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {diary.costBreakdown.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `₹${value}`}
                      contentStyle={{
                        backgroundColor: "rgba(30, 41, 59, 0.9)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6 slide-in-animation">
                <h2 className="text-2xl font-bold gradient-text mb-6">Monthly Investment Progress</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={diary.monthlyProgress}>
                    <defs>
                      <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30, 41, 59, 0.9)",
                        border: "1px solid rgba(148, 163, 184, 0.2)",
                        borderRadius: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="investment"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorInvestment)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold gradient-text mb-4">🌍 Weather Conditions</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-sm text-slate-400">Average Temperature</p>
                      <p className="font-semibold text-white">{diary.weatherConditions.avgTemp}°C</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Droplet className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-400">Average Humidity</p>
                      <p className="font-semibold text-white">{diary.weatherConditions.avgHumidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wind className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm text-slate-400">Rainfall</p>
                      <p className="font-semibold text-white">{diary.weatherConditions.rainfall}mm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-yellow-400" />
                    <div>
                      <p className="text-sm text-slate-400">Sunlight</p>
                      <p className="font-semibold text-white">{diary.weatherConditions.sunlight}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-bold gradient-text mb-4">🧪 Soil Health</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">pH Level</p>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                        style={{ width: `${(diary.soilHealth.ph / 8) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-semibold text-white mt-1">{diary.soilHealth.ph}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Nitrogen (N)</p>
                    <p className="font-semibold text-white">{diary.soilHealth.nitrogen} mg/kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Phosphorus (P)</p>
                    <p className="font-semibold text-white">{diary.soilHealth.phosphorus} mg/kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Potassium (K)</p>
                    <p className="font-semibold text-white">{diary.soilHealth.potassium} mg/kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Organic Matter</p>
                    <p className="font-semibold text-white">{diary.soilHealth.organicMatter}%</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-xl font-bold gradient-text mb-4">📋 Key Information</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-slate-400">Planting Date</p>
                    <p className="font-semibold text-white">{new Date(diary.plantingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Expected Harvest</p>
                    <p className="font-semibold text-white">
                      {new Date(diary.expectedHarvestDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Current Stage</p>
                    <p className="font-semibold text-white capitalize">
                      {diary.currentStage.name.replace("-", " ")} - {diary.currentStage.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Season</p>
                    <p className="font-semibold text-white">{diary.crop.season}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 slide-in-animation">
              <h2 className="text-2xl font-bold gradient-text mb-6">Activity Timeline</h2>
              <div className="space-y-4">
                {diary.activities.map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex gap-4 glass-card-vibrant p-4 rounded-lg hover:scale-102 transition-transform"
                  >
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white mb-1">{activity.type}</h4>
                          <p className="text-sm text-slate-300">{activity.description}</p>
                        </div>
                        <span className="text-right">
                          <p className="font-semibold text-green-400">₹{activity.cost}</p>
                          <p className="text-xs text-slate-400">{new Date(activity.date).toLocaleDateString()}</p>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <Link href="/crop-diary" className="btn btn-secondary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to List
              </Link>
              <button className="btn btn-primary">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}
