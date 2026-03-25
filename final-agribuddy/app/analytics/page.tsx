"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import PrivateRoute from "../components/PrivateRoute"
import Navbar from "../components/Navbar"
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, DollarSign, Sprout, Droplets, Activity } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  AreaChart,
  Area,
  Pie,
} from "recharts"

export default function Analytics() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [selectedPeriod, setSelectedPeriod] = useState("6months")

  useEffect(() => {
    fetchAnalyticsData()
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      // Mock data for demonstration
      setAnalyticsData({
        summary: {
          totalRevenue: 125000,
          totalCosts: 85000,
          profit: 40000,
          profitMargin: 32,
          totalYield: 2400,
          averageYield: 96,
          waterUsage: 15000,
          fertilizer: 850,
        },
        yieldTrend: [
          { month: "Jan", yield: 2100, cost: 12000, revenue: 18000 },
          { month: "Feb", yield: 1800, cost: 10000, revenue: 15000 },
          { month: "Mar", yield: 2800, cost: 15000, revenue: 22000 },
          { month: "Apr", yield: 2200, cost: 13000, revenue: 19000 },
          { month: "May", yield: 2600, cost: 14000, revenue: 21000 },
          { month: "Jun", yield: 2400, cost: 13500, revenue: 20000 },
        ],
        cropDistribution: [
          { name: "Rice", value: 45, color: "#10b981" },
          { name: "Wheat", value: 30, color: "#3b82f6" },
          { name: "Corn", value: 15, color: "#f59e0b" },
          { name: "Vegetables", value: 10, color: "#ef4444" },
        ],
        costBreakdown: [
          { category: "Seeds", amount: 15000, percentage: 18 },
          { category: "Fertilizer", amount: 25000, percentage: 29 },
          { category: "Water", amount: 12000, percentage: 14 },
          { category: "Labor", amount: 20000, percentage: 24 },
          { category: "Equipment", amount: 8000, percentage: 9 },
          { category: "Other", amount: 5000, percentage: 6 },
        ],
        efficiency: [
          { metric: "Water Usage", current: 85, target: 90, unit: "%" },
          { metric: "Fertilizer Efficiency", current: 78, target: 85, unit: "%" },
          { metric: "Yield per Acre", current: 92, target: 95, unit: "%" },
          { metric: "Cost Efficiency", current: 88, target: 90, unit: "%" },
        ],
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("analytics")}</h1>
                <p className="text-gray-600">{t("farmPerformanceInsights")}</p>
              </div>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="3months">{t("last3Months")}</option>
                <option value="6months">{t("last6Months")}</option>
                <option value="1year">{t("lastYear")}</option>
              </select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("totalRevenue")}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(analyticsData?.summary?.totalRevenue || 0)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">+12.5%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("totalProfit")}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(analyticsData?.summary?.profit || 0)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">+8.2%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("totalYield")}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analyticsData?.summary?.totalYield || 0} kg
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">+15.3%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Sprout className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("profitMargin")}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {analyticsData?.summary?.profitMargin || 0}%
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">-2.1%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Yield & Revenue Trend */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("yieldRevenueTrend")}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData?.yieldTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => [
                      name === 'yield' ? `${value} kg` : formatCurrency(Number(value)),
                      name === 'yield' ? t('yield') : name === 'revenue' ? t('revenue') : t('cost')
                    ]} />
                    <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="cost" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Line type="monotone" dataKey="yield" stroke="#3b82f6" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Crop Distribution */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("cropDistribution")}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analyticsData?.cropDistribution || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {analyticsData?.cropDistribution?.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Cost Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("costBreakdown")}</h2>
                <div className="space-y-4">
                  {analyticsData?.costBreakdown?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.amount)}
                        </div>
                        <div className="text-xs text-gray-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Efficiency Metrics */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("efficiencyMetrics")}</h2>
                <div className="space-y-6">
                  {analyticsData?.efficiency?.map((metric: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{metric.metric}</span>
                        <span className="text-sm text-gray-600">
                          {metric.current}{metric.unit} / {metric.target}{metric.unit}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.current >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${(metric.current / metric.target) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-8 bg-green-50 rounded-xl border border-green-200 p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">{t("recommendations")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Droplets className="w-5 h-5 text-blue-500" />
                    <h3 className="font-medium text-green-800">{t("waterOptimization")}</h3>
                  </div>
                  <p className="text-sm text-green-700">
                    {t("waterOptimizationDesc")}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <h3 className="font-medium text-green-800">{t("yieldImprovement")}</h3>
                  </div>
                  <p className="text-sm text-green-700">
                    {t("yieldImprovementDesc")}
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
