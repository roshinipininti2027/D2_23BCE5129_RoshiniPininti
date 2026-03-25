const express = require("express")
const Farm = require("../models/Farm")
const CropSchedule = require("../models/CropSchedule")
const ActivityLog = require("../models/ActivityLog")
const WeatherData = require("../models/WeatherData")
const auth = require("../middleware/auth")

const router = express.Router()

// Get dashboard analytics
router.get("/dashboard", auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { period = "6months" } = req.query

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case "1month":
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "3months":
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case "6months":
        startDate.setMonth(endDate.getMonth() - 6)
        break
      case "1year":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(endDate.getMonth() - 6)
    }

    // Get user's farms
    const farms = await Farm.find({ owner: userId, isActive: true })
    const farmIds = farms.map(farm => farm._id)

    // Basic statistics
    const totalFarms = farms.length
    const totalArea = farms.reduce((sum, farm) => sum + farm.area.value, 0)
    const activeCrops = farms.reduce((sum, farm) => sum + farm.activeCropsCount, 0)

    // Crop schedules analytics
    const schedules = await CropSchedule.find({
      farmer: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    })

    const completedSchedules = schedules.filter(s => s.status === "Completed").length
    const activeSchedules = schedules.filter(s => s.status === "Active").length

    // Activity analytics
    const activities = await ActivityLog.find({
      farmer: userId,
      date: { $gte: startDate, $lte: endDate }
    })

    // Yield analytics
    const yieldData = await CropSchedule.aggregate([
      {
        $match: {
          farmer: userId,
          status: "Completed",
          "yield.actual.quantity": { $exists: true, $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$dates.harvesting" },
            year: { $year: "$dates.harvesting" }
          },
          totalYield: { $sum: "$yield.actual.quantity" },
          avgYield: { $avg: "$yield.actual.quantity" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ])

    // Cost analytics
    const costData = await ActivityLog.aggregate([
      {
        $match: {
          farmer: userId,
          date: { $gte: startDate, $lte: endDate },
          "costs.total": { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          totalCost: { $sum: "$costs.total" },
          materialsCost: { $sum: "$costs.materials" },
          laborCost: { $sum: "$costs.labor" },
          machineryCost: { $sum: "$costs.machinery" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ])

    // Crop distribution
    const cropDistribution = await CropSchedule.aggregate([
      {
        $match: {
          farmer: userId,
          status: { $in: ["Active", "Completed"] }
        }
      },
      {
        $group: {
          _id: "$cropName",
          count: { $sum: 1 },
          totalArea: { $sum: "$area.actual.value" },
          avgYield: { $avg: "$yield.actual.quantity" }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ])

    // Activity distribution
    const activityDistribution = await ActivityLog.aggregate([
      {
        $match: {
          farmer: userId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
          totalCost: { $sum: "$costs.total" },
          avgDuration: { $avg: "$duration.hours" }
        }
      },
      {
        $sort: { count: -1 }
      }
    ])

    // Weather impact analysis
    const weatherImpact = await WeatherData.aggregate([
      {
        $match: {
          "location.coordinates": {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: farms[0]?.location.coordinates || [0, 0]
              },
              $maxDistance: 50000
            }
          },
          "dataSource.lastUpdated": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$dataSource.lastUpdated" },
            year: { $year: "$dataSource.lastUpdated" }
          },
          avgTemp: { $avg: "$current.temperature" },
          avgHumidity: { $avg: "$current.humidity" },
          totalRainfall: { $sum: "$current.rainfall" },
          alertsCount: { $sum: { $size: "$alerts" } }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ])

    // Performance metrics
    const performanceMetrics = {
      farmUtilization: totalArea > 0 ? Math.round((farms.reduce((sum, farm) => sum + farm.totalPlantedArea, 0) / totalArea) * 100) : 0,
      scheduleCompletion: schedules.length > 0 ? Math.round((completedSchedules / schedules.length) * 100) : 0,
      avgYieldPerHectare: yieldData.length > 0 ? yieldData.reduce((sum, item) => sum + item.avgYield, 0) / yieldData.length : 0,
      costEfficiency: costData.length > 0 ? costData.reduce((sum, item) => sum + item.totalCost, 0) / totalArea : 0
    }

    // Trends calculation
    const trends = {
      yield: calculateTrend(yieldData.map(item => item.totalYield)),
      cost: calculateTrend(costData.map(item => item.totalCost)),
      activities: calculateTrend(activityDistribution.map(item => item.count))
    }

    res.json({
      summary: {
        totalFarms,
        totalArea,
        activeCrops,
        completedSchedules,
        activeSchedules,
        totalActivities: activities.length,
        performanceMetrics
      },
      charts: {
        yieldTrend: yieldData,
        costAnalysis: costData,
        cropDistribution,
        activityDistribution,
        weatherImpact
      },
      trends,
      period: {
        start: startDate,
        end: endDate,
        label: period
      }
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get farm-specific analytics
router.get("/farm/:farmId", auth, async (req, res) => {
  try {
    const { farmId } = req.params
    const userId = req.user.id
    const { period = "6months" } = req.query

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, owner: userId })
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(endDate.getMonth() - (period === "1year" ? 12 : 6))

    // Farm activities
    const activities = await ActivityLog.find({
      farm: farmId,
      date: { $gte: startDate, $lte: endDate }
    }).populate("crops.crop", "name category")

    // Crop schedules for this farm
    const schedules = await CropSchedule.find({
      farm: farmId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate("crop", "name category")

    // Cost breakdown
    const costBreakdown = activities.reduce((acc, activity) => {
      acc.materials += activity.costs.materials || 0
      acc.labor += activity.costs.labor || 0
      acc.machinery += activity.costs.machinery || 0
      acc.other += activity.costs.other || 0
      return acc
    }, { materials: 0, labor: 0, machinery: 0, other: 0 })

    // Productivity metrics
    const productivity = {
      totalYield: schedules.reduce((sum, schedule) => sum + (schedule.yield.actual?.quantity || 0), 0),
      yieldPerAcre: 0,
      costPerAcre: (costBreakdown.materials + costBreakdown.labor + costBreakdown.machinery + costBreakdown.other) / farm.area.value,
      profitMargin: 0
    }

    productivity.yieldPerAcre = productivity.totalYield / farm.area.value
    
    // Calculate profit margin (simplified)
    const totalRevenue = schedules.reduce((sum, schedule) => {
      const yield = schedule.yield.actual?.quantity || 0
      const price = schedule.marketInfo?.actualPrice || schedule.marketInfo?.plannedPrice || 0
      return sum + (yield * price)
    }, 0)
    
    const totalCost = Object.values(costBreakdown).reduce((sum, cost) => sum + cost, 0)
    productivity.profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0

    // Seasonal analysis
    const seasonalData = await ActivityLog.aggregate([
      {
        $match: {
          farm: farmId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            activityType: "$activityType"
          },
          count: { $sum: 1 },
          totalCost: { $sum: "$costs.total" }
        }
      },
      {
        $sort: { "_id.month": 1 }
      }
    ])

    res.json({
      farm: {
        id: farm._id,
        name: farm.name,
        area: farm.area,
        location: farm.location,
        soilType: farm.soilType,
        irrigationType: farm.irrigationType
      },
      summary: {
        totalActivities: activities.length,
        activeSchedules: schedules.filter(s => s.status === "Active").length,
        completedSchedules: schedules.filter(s => s.status === "Completed").length,
        totalCost: Object.values(costBreakdown).reduce((sum, cost) => sum + cost, 0),
        productivity
      },
      breakdown: {
        costBreakdown,
        activityTypes: activities.reduce((acc, activity) => {
          acc[activity.activityType] = (acc[activity.activityType] || 0) + 1
          return acc
        }, {}),
        cropPerformance: schedules.map(schedule => ({
          cropName: schedule.cropName,
          variety: schedule.variety,
          area: schedule.area.actual?.value || schedule.area.planned?.value,
          expectedYield: schedule.yield.expected?.quantity,
          actualYield: schedule.yield.actual?.quantity,
          status: schedule.status,
          progress: schedule.progress
        }))
      },
      charts: {
        seasonalData,
        costTrend: activities.map(activity => ({
          date: activity.date,
          cost: activity.costs.total,
          type: activity.activityType
        }))
      },
      period: {
        start: startDate,
        end: endDate,
        label: period
      }
    })
  } catch (error) {
    console.error("Error fetching farm analytics:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get crop performance analytics
router.get("/crops/performance", auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { cropName, period = "1year" } = req.query

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setFullYear(endDate.getFullYear() - 1)

    const matchQuery = {
      farmer: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    }

    if (cropName) {
      matchQuery.cropName = cropName
    }

    // Crop performance data
    const performance = await CropSchedule.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$cropName",
          totalSchedules: { $sum: 1 },
          completedSchedules: {
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          avgYield: { $avg: "$yield.actual.quantity" },
          maxYield: { $max: "$yield.actual.quantity" },
          minYield: { $min: "$yield.actual.quantity" },
          totalArea: { $sum: "$area.actual.value" },
          avgProgress: { $avg: "$progress" },
          successRate: {
            $avg: {
              $cond: [
                { $eq: ["$status", "Completed"] },
                100,
                { $cond: [{ $eq: ["$status", "Failed"] }, 0, "$progress"] }
              ]
            }
          }
        }
      },
      { $sort: { totalSchedules: -1 } }
    ])

    // Yield trends over time
    const yieldTrends = await CropSchedule.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            crop: "$cropName",
            month: { $month: "$dates.harvesting" },
            year: { $year: "$dates.harvesting" }
          },
          avgYield: { $avg: "$yield.actual.quantity" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])

    // Cost vs yield analysis
    const costYieldAnalysis = await CropSchedule.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "activitylogs",
          localField: "_id",
          foreignField: "schedule",
          as: "activities"
        }
      },
      {
        $group: {
          _id: "$cropName",
          avgYield: { $avg: "$yield.actual.quantity" },
          avgCost: {
            $avg: {
              $sum: {
                $map: {
                  input: "$activities",
                  as: "activity",
                  in: "$$activity.costs.total"
                }
              }
            }
          },
          profitability: {
            $avg: {
              $subtract: [
                { $multiply: ["$yield.actual.quantity", "$marketInfo.actualPrice"] },
                {
                  $sum: {
                    $map: {
                      input: "$activities",
                      as: "activity",
                      in: "$$activity.costs.total"
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ])

    res.json({
      performance,
      trends: yieldTrends,
      costYieldAnalysis,
      summary: {
        totalCrops: performance.length,
        avgSuccessRate: performance.reduce((sum, crop) => sum + crop.successRate, 0) / performance.length,
        mostProfitable: costYieldAnalysis.sort((a, b) => b.profitability - a.profitability)[0],
        bestPerforming: performance.sort((a, b) => b.avgYield - a.avgYield)[0]
      }
    })
  } catch (error) {
    console.error("Error fetching crop performance:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get weather analytics
router.get("/weather/impact", auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { period = "3months" } = req.query

    // Get user's farms for location
    const farms = await Farm.find({ owner: userId, isActive: true }).limit(1)
    if (farms.length === 0) {
      return res.json({ message: "No farms found" })
    }

    const farmLocation = farms[0].location.coordinates

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(endDate.getMonth() - 3)

    // Weather data analysis
    const weatherAnalysis = await WeatherData.aggregate([
      {
        $match: {
          "location.coordinates": {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: farmLocation
              },
              $maxDistance: 50000
            }
          },
          "dataSource.lastUpdated": { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$dataSource.lastUpdated" },
            year: { $year: "$dataSource.lastUpdated" }
          },
          avgTemp: { $avg: "$current.temperature" },
          maxTemp: { $max: "$current.temperature" },
          minTemp: { $min: "$current.temperature" },
          avgHumidity: { $avg: "$current.humidity" },
          totalRainfall: { $sum: "$current.rainfall" },
          avgWindSpeed: { $avg: "$current.windSpeed" },
          alertsCount: { $sum: { $size: "$alerts" } },
          favorableDays: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$current.temperature", 20] },
                    { $lte: ["$current.temperature", 30] },
                    { $gte: ["$current.humidity", 40] },
                    { $lte: ["$current.humidity", 70] }
                  ]
                },
                1,
                0
              ]
            }
          },
          totalDays: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])

    // Correlation with crop performance
    const activities = await ActivityLog.find({
      farmer: userId,
      date: { $gte: startDate, $lte: endDate }
    })

    const weatherImpact = weatherAnalysis.map(weather => {
      const monthActivities = activities.filter(activity => {
        const activityMonth = activity.date.getMonth() + 1
        const activityYear = activity.date.getFullYear()
        return activityMonth === weather._id.month && activityYear === weather._id.year
      })

      const successfulActivities = monthActivities.filter(activity => 
        activity.results.success === "Excellent" || activity.results.success === "Good"
      ).length

      return {
        ...weather,
        activityCount: monthActivities.length,
        successRate: monthActivities.length > 0 ? (successfulActivities / monthActivities.length) * 100 : 0,
        favorabilityIndex: (weather.favorableDays / weather.totalDays) * 100
      }
    })

    res.json({
      weatherAnalysis: weatherImpact,
      summary: {
        avgTemperature: weatherAnalysis.reduce((sum, w) => sum + w.avgTemp, 0) / weatherAnalysis.length,
        totalRainfall: weatherAnalysis.reduce((sum, w) => sum + w.totalRainfall, 0),
        totalAlerts: weatherAnalysis.reduce((sum, w) => sum + w.alertsCount, 0),
        favorabilityScore: weatherImpact.reduce((sum, w) => sum + w.favorabilityIndex, 0) / weatherImpact.length
      },
      recommendations: generateWeatherRecommendations(weatherImpact)
    })
  } catch (error) {
    console.error("Error fetching weather analytics:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Helper function to calculate trend
function calculateTrend(data) {
  if (data.length < 2) return 0
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2))
  const secondHalf = data.slice(Math.floor(data.length / 2))
  
  const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
  
  return ((secondAvg - firstAvg) / firstAvg) * 100
}

// Helper function to generate weather recommendations
function generateWeatherRecommendations(weatherData) {
  const recommendations = []
  
  const latestWeather = weatherData[weatherData.length - 1]
  if (!latestWeather) return recommendations

  if (latestWeather.avgTemp > 35) {
    recommendations.push({
      type: "temperature",
      priority: "high",
      message: "High temperatures detected. Increase irrigation frequency and provide shade for sensitive crops."
    })
  }

  if (latestWeather.totalRainfall < 10) {
    recommendations.push({
      type: "irrigation",
      priority: "medium",
      message: "Low rainfall this month. Plan additional irrigation to maintain soil moisture."
    })
  }

  if (latestWeather.alertsCount > 5) {
    recommendations.push({
      type: "alerts",
      priority: "high",
      message: "Multiple weather alerts this month. Review and implement protective measures for crops."
    })
  }

  if (latestWeather.favorabilityIndex < 50) {
    recommendations.push({
      type: "planning",
      priority: "medium",
      message: "Weather conditions are less favorable. Consider adjusting planting schedules and crop selection."
    })
  }

  return recommendations
}

module.exports = router
