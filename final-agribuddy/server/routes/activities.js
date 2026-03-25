const express = require("express")
const { body, validationResult } = require("express-validator")
const ActivityLog = require("../models/ActivityLog")
const Farm = require("../models/Farm")
const CropSchedule = require("../models/CropSchedule")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all activities for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      farmId, 
      activityType, 
      startDate, 
      endDate,
      sortBy = "date", 
      sortOrder = "desc" 
    } = req.query

    const query = { farmer: req.user.id }
    
    if (farmId) query.farm = farmId
    if (activityType) query.activityType = activityType
    
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate)
      if (endDate) query.date.$lte = new Date(endDate)
    }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const activities = await ActivityLog.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("farm", "name location")
      .populate("schedule", "cropName variety season year")
      .populate("crops.crop", "name category")

    const total = await ActivityLog.countDocuments(query)

    res.json({
      activities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error("Error fetching activities:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get activity by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const activity = await ActivityLog.findOne({ 
      _id: req.params.id, 
      farmer: req.user.id 
    })
    .populate("farm", "name location area")
    .populate("schedule", "cropName variety season year")
    .populate("crops.crop", "name category")
    .populate("expertReviews.expert", "name expertise certification")

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" })
    }

    res.json(activity)
  } catch (error) {
    console.error("Error fetching activity:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new activity log
router.post("/", [
  auth,
  body("farmId").notEmpty().withMessage("Farm ID is required"),
  body("activityType").notEmpty().withMessage("Activity type is required"),
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("date").isISO8601().withMessage("Valid date is required")
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const {
      farmId,
      scheduleId,
      activityType,
      title,
      description,
      date,
      duration,
      location,
      crops,
      materials,
      labor,
      machinery,
      weather,
      results,
      images,
      videos,
      documents,
      geoLocation,
      tags,
      isPublic
    } = req.body

    // Verify farm ownership
    const farm = await Farm.findOne({ _id: farmId, owner: req.user.id })
    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    // Verify schedule if provided
    if (scheduleId) {
      const schedule = await CropSchedule.findOne({ 
        _id: scheduleId, 
        farmer: req.user.id 
      })
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" })
      }
    }

    // Calculate costs
    const costs = {
      materials: materials ? materials.reduce((sum, m) => sum + (m.cost || 0), 0) : 0,
      labor: 0,
      machinery: 0,
      other: 0
    }

    if (labor) {
      if (labor.hiredLabor) {
        costs.labor += labor.hiredLabor.reduce((sum, l) => sum + (l.totalCost || 0), 0)
      }
    }

    if (machinery) {
      costs.machinery = machinery.reduce((sum, m) => 
        sum + (m.fuelCost || 0) + (m.operatorCost || 0) + 
        (m.maintenanceCost || 0) + (m.rentalCost || 0), 0)
    }

    const activity = new ActivityLog({
      farmer: req.user.id,
      farm: farmId,
      schedule: scheduleId || null,
      activityType,
      title,
      description,
      date: new Date(date),
      duration: duration || {},
      location: location || {},
      crops: crops || [],
      materials: materials || [],
      labor: labor || {},
      machinery: machinery || [],
      weather: weather || {},
      results: results || {},
      costs,
      images: images || [],
      videos: videos || [],
      documents: documents || [],
      geoLocation: geoLocation || null,
      tags: tags || [],
      isPublic: isPublic || false
    })

    await activity.save()

    res.status(201).json({
      message: "Activity logged successfully",
      activity: await activity.populate([
        { path: "farm", select: "name location" },
        { path: "schedule", select: "cropName variety" }
      ])
    })
  } catch (error) {
    console.error("Error creating activity:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update activity
router.put("/:id", auth, async (req, res) => {
  try {
    const activity = await ActivityLog.findOne({ 
      _id: req.params.id, 
      farmer: req.user.id 
    })

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" })
    }

    const {
      title,
      description,
      duration,
      materials,
      labor,
      machinery,
      weather,
      results,
      images,
      videos,
      tags,
      isPublic
    } = req.body

    // Update fields
    if (title) activity.title = title
    if (description) activity.description = description
    if (duration) activity.duration = { ...activity.duration, ...duration }
    if (materials) activity.materials = materials
    if (labor) activity.labor = { ...activity.labor, ...labor }
    if (machinery) activity.machinery = machinery
    if (weather) activity.weather = { ...activity.weather, ...weather }
    if (results) activity.results = { ...activity.results, ...results }
    if (images) activity.images = images
    if (videos) activity.videos = videos
    if (tags) activity.tags = tags
    if (typeof isPublic === 'boolean') activity.isPublic = isPublic

    // Recalculate costs
    activity.costs.materials = activity.materials.reduce((sum, m) => sum + (m.cost || 0), 0)
    
    if (activity.labor.hiredLabor) {
      activity.costs.labor = activity.labor.hiredLabor.reduce((sum, l) => sum + (l.totalCost || 0), 0)
    }
    
    activity.costs.machinery = activity.machinery.reduce((sum, m) => 
      sum + (m.fuelCost || 0) + (m.operatorCost || 0) + 
      (m.maintenanceCost || 0) + (m.rentalCost || 0), 0)

    await activity.save()

    res.json({
      message: "Activity updated successfully",
      activity
    })
  } catch (error) {
    console.error("Error updating activity:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete activity
router.delete("/:id", auth, async (req, res) => {
  try {
    const activity = await ActivityLog.findOne({ 
      _id: req.params.id, 
      farmer: req.user.id 
    })

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" })
    }

    activity.status = "Archived"
    await activity.save()

    res.json({ message: "Activity deleted successfully" })
  } catch (error) {
    console.error("Error deleting activity:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get activity statistics
router.get("/stats/summary", auth, async (req, res) => {
  try {
    const { period = "month", farmId } = req.query
    
    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    
    switch (period) {
      case "week":
        startDate.setDate(endDate.getDate() - 7)
        break
      case "month":
        startDate.setMonth(endDate.getMonth() - 1)
        break
      case "quarter":
        startDate.setMonth(endDate.getMonth() - 3)
        break
      case "year":
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
      default:
        startDate.setMonth(endDate.getMonth() - 1)
    }

    const query = {
      farmer: req.user.id,
      date: { $gte: startDate, $lte: endDate }
    }
    
    if (farmId) query.farm = farmId

    // Activity statistics
    const stats = await ActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalActivities: { $sum: 1 },
          totalCost: { $sum: "$costs.total" },
          avgCostPerActivity: { $avg: "$costs.total" },
          totalHours: { $sum: "$duration.hours" },
          avgHoursPerActivity: { $avg: "$duration.hours" }
        }
      }
    ])

    // Activity type distribution
    const typeDistribution = await ActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$activityType",
          count: { $sum: 1 },
          totalCost: { $sum: "$costs.total" },
          avgCost: { $avg: "$costs.total" }
        }
      },
      { $sort: { count: -1 } }
    ])

    // Cost breakdown
    const costBreakdown = await ActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          materials: { $sum: "$costs.materials" },
          labor: { $sum: "$costs.labor" },
          machinery: { $sum: "$costs.machinery" },
          other: { $sum: "$costs.other" }
        }
      }
    ])

    // Monthly trend
    const monthlyTrend = await ActivityLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          count: { $sum: 1 },
          totalCost: { $sum: "$costs.total" },
          totalHours: { $sum: "$duration.hours" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])

    res.json({
      summary: stats[0] || {
        totalActivities: 0,
        totalCost: 0,
        avgCostPerActivity: 0,
        totalHours: 0,
        avgHoursPerActivity: 0
      },
      typeDistribution,
      costBreakdown: costBreakdown[0] || {
        materials: 0,
        labor: 0,
        machinery: 0,
        other: 0
      },
      monthlyTrend,
      period: {
        start: startDate,
        end: endDate,
        label: period
      }
    })
  } catch (error) {
    console.error("Error fetching activity stats:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get public activities (for community sharing)
router.get("/public/feed", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, activityType, tags } = req.query
    
    const query = { 
      isPublic: true,
      status: "Published"
    }
    
    if (activityType) query.activityType = activityType
    if (tags) query.tags = { $in: tags.split(",") }

    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("farmer", "name location.state")
      .populate("farm", "name location.district location.state")
      .select("-costs -labor.hiredLabor.rate -labor.hiredLabor.totalCost")

    const total = await ActivityLog.countDocuments(query)

    res.json({
      activities,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error("Error fetching public activities:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add expert review to activity
router.post("/:id/reviews", auth, async (req, res) => {
  try {
    // Check if user is an expert
    const User = require("../models/User")
    const expert = await User.findById(req.user.id)
    if (!expert || expert.role !== "expert") {
      return res.status(403).json({ message: "Only experts can add reviews" })
    }

    const activity = await ActivityLog.findById(req.params.id)
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" })
    }

    const { rating, feedback, suggestions } = req.body

    const review = {
      expert: req.user.id,
      rating: parseInt(rating),
      feedback,
      suggestions: suggestions || []
    }

    activity.expertReviews.push(review)
    await activity.save()

    // Create notification for farmer
    const Notification = require("../models/Notification")
    await Notification.create({
      recipient: activity.farmer,
      sender: req.user.id,
      type: "expert_response",
      category: "info",
      priority: "medium",
      title: "Expert Review Received",
      message: `${expert.name} has reviewed your ${activity.activityType} activity.`,
      data: {
        activityId: activity._id,
        rating: rating
      }
    })

    res.status(201).json({
      message: "Review added successfully",
      review
    })
  } catch (error) {
    console.error("Error adding review:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
