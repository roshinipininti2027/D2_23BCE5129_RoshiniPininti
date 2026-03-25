const express = require("express")
const { body, validationResult } = require("express-validator")
const CropSchedule = require("../models/CropSchedule")
const Farm = require("../models/Farm")
const Crop = require("../models/Crop")
const Notification = require("../models/Notification")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all schedules for user's farms
router.get("/", auth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      season, 
      year, 
      farmId,
      sortBy = "createdAt", 
      sortOrder = "desc" 
    } = req.query

    const query = { farmer: req.user.id }
    
    if (status) query.status = status
    if (season) query.season = season
    if (year) query.year = parseInt(year)
    if (farmId) query.farm = farmId

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const schedules = await CropSchedule.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("farm", "name location area")
      .populate("crop", "name category growthStages")

    const total = await CropSchedule.countDocuments(query)

    // Calculate progress for each schedule
    schedules.forEach(schedule => {
      schedule.calculateProgress()
    })

    res.json({
      schedules,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error("Error fetching schedules:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get schedules for specific farm
router.get("/farm/:farmId", auth, async (req, res) => {
  try {
    // Verify farm belongs to user
    const farm = await Farm.findOne({
      _id: req.params.farmId,
      owner: req.user.id,
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    const schedules = await CropSchedule.find({
      farm: req.params.farmId,
    }).populate("activities")

    res.json(schedules)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get schedule by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const schedule = await CropSchedule.findOne({ 
      _id: req.params.id, 
      farmer: req.user.id 
    })
    .populate("farm", "name location area soilType irrigationType")
    .populate("crop", "name category growthStages climaticRequirements")
    .populate("expertConsultations.expert", "name expertise certification")

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    // Calculate progress
    schedule.calculateProgress()

    // Get upcoming and overdue activities
    const upcomingActivities = schedule.getUpcomingActivities()
    const overdueActivities = schedule.getOverdueActivities()

    res.json({
      schedule,
      upcomingActivities,
      overdueActivities,
      progress: schedule.progress
    })
  } catch (error) {
    console.error("Error fetching schedule:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create crop schedule
router.post(
  "/",
  [
    auth,
    body("farmId").notEmpty().withMessage("Farm ID is required"),
    body("cropId").notEmpty().withMessage("Crop ID is required"),
    body("season").isIn(["kharif", "rabi", "zaid"]).withMessage("Valid season is required"),
    body("year").isNumeric().withMessage("Year must be a number"),
    body("area").isNumeric().withMessage("Planned area must be a number")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        farmId,
        cropId,
        variety,
        season,
        year,
        area,
        areaUnit,
        plantingDate,
        customActivities
      } = req.body

      // Verify farm belongs to user
      const farm = await Farm.findOne({ _id: farmId, owner: req.user.id })
      if (!farm) {
        return res.status(404).json({ message: "Farm not found" })
      }

      // Get crop details
      const crop = await Crop.findById(cropId)
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" })
      }

      // Generate activities based on crop growth stages
      const activities = []
      let currentDate = new Date(plantingDate)

      // Land preparation (7 days before planting)
      const landPrepDate = new Date(currentDate)
      landPrepDate.setDate(landPrepDate.getDate() - 7)
      activities.push({
        type: "Land Preparation",
        scheduledDate: landPrepDate,
        description: "Prepare land for sowing - plowing, leveling, and soil preparation",
        status: "Planned"
      })

      // Generate activities for each growth stage
      crop.growthStages.forEach((stage, index) => {
        const stageStartDate = new Date(currentDate)
        stageStartDate.setDate(stageStartDate.getDate() + 
          crop.growthStages.slice(0, index).reduce((sum, s) => sum + s.duration, 0))

        // Add stage-specific activities
        stage.activities.forEach(activity => {
          activities.push({
            type: activity,
            scheduledDate: new Date(stageStartDate),
            description: `${activity} for ${stage.stage} stage`,
            status: "Planned"
          })
        })
      })

      // Add custom activities if provided
      if (customActivities && customActivities.length > 0) {
        customActivities.forEach(activity => {
          activities.push({
            type: activity.type,
            scheduledDate: new Date(activity.date),
            description: activity.description,
            status: "Planned"
          })
        })
      }

      // Calculate expected harvest date
      const totalDuration = crop.growthStages.reduce((sum, stage) => sum + stage.duration, 0)
      const expectedHarvestDate = new Date(currentDate)
      expectedHarvestDate.setDate(expectedHarvestDate.getDate() + totalDuration)

      const schedule = new CropSchedule({
        farmer: req.user.id,
        farm: farmId,
        crop: cropId,
        cropName: crop.name,
        variety: variety || "",
        season,
        year: parseInt(year),
        area: {
          planned: {
            value: area,
            unit: areaUnit || "acres"
          }
        },
        dates: {
          landPreparation: landPrepDate,
          sowing: currentDate,
          harvesting: expectedHarvestDate
        },
        activities: activities.sort((a, b) => a.scheduledDate - b.scheduledDate),
        currentStage: "Planning",
        status: "Draft"
      })

      await schedule.save()

      // Create notification for schedule creation
      await Notification.create({
        recipient: req.user.id,
        type: "crop_schedule",
        category: "info",
        priority: "medium",
        title: "New Crop Schedule Created",
        message: `Schedule for ${crop.name} (${season} ${year}) has been created successfully.`,
        data: {
          scheduleId: schedule._id,
          farmId: farmId
        }
      })

      res.status(201).json({
        message: "Crop schedule created successfully",
        schedule: await schedule.populate([
          { path: "farm", select: "name location" },
          { path: "crop", select: "name category" }
        ])
      })
    } catch (error) {
      console.error("Error creating schedule:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Update crop schedule
router.put("/:id", auth, async (req, res) => {
  try {
    const schedule = await CropSchedule.findOne({ 
      _id: req.params.id, 
      farmer: req.user.id 
    })

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    const {
      variety,
      area,
      areaUnit,
      currentStage,
      status,
      yield,
      marketInfo,
      notes
    } = req.body

    // Update fields
    if (variety) schedule.variety = variety
    if (area) {
      if (!schedule.area.actual) schedule.area.actual = {}
      schedule.area.actual.value = area
      if (areaUnit) schedule.area.actual.unit = areaUnit
    }
    if (currentStage) schedule.currentStage = currentStage
    if (status) schedule.status = status
    if (yield) schedule.yield = { ...schedule.yield, ...yield }
    if (marketInfo) schedule.marketInfo = { ...schedule.marketInfo, ...marketInfo }

    await schedule.save()

    res.json({
      message: "Schedule updated successfully",
      schedule
    })
  } catch (error) {
    console.error("Error updating schedule:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update activity status
router.put("/:scheduleId/activities/:activityIndex", auth, async (req, res) => {
  try {
    const schedule = await CropSchedule.findOne({ 
      _id: req.params.scheduleId, 
      farmer: req.user.id 
    })

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    const activityIndex = parseInt(req.params.activityIndex)
    if (activityIndex < 0 || activityIndex >= schedule.activities.length) {
      return res.status(404).json({ message: "Activity not found" })
    }

    const {
      status,
      actualDate,
      notes,
      materials,
      laborRequired,
      images
    } = req.body

    const activity = schedule.activities[activityIndex]
    
    if (status) activity.status = status
    if (actualDate) activity.actualDate = new Date(actualDate)
    if (notes) activity.notes = notes
    if (materials) activity.materials = materials
    if (laborRequired) activity.laborRequired = laborRequired
    if (images) activity.images = images

    if (status === "Completed") {
      activity.completedBy = req.user.id
      activity.completedAt = new Date()
    }

    // Recalculate progress
    schedule.calculateProgress()

    await schedule.save()

    res.json({
      message: "Activity updated successfully",
      activity,
      progress: schedule.progress
    })
  } catch (error) {
    console.error("Error updating activity:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add expert consultation
router.post("/:id/consultations", auth, async (req, res) => {
  try {
    const schedule = await CropSchedule.findOne({ 
      _id: req.params.id, 
      farmer: req.user.id 
    })

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    const { query, images } = req.body

    const consultation = {
      query,
      images: images || [],
      status: "Pending"
    }

    schedule.expertConsultations.push(consultation)
    await schedule.save()

    // Create notification for experts (simplified - in real app, would target specific experts)
    const User = require("../models/User")
    const experts = await User.find({ role: "expert" }).limit(5)
    
    for (const expert of experts) {
      await Notification.create({
        recipient: expert._id,
        sender: req.user.id,
        type: "expert_response",
        category: "info",
        priority: "medium",
        title: "New Consultation Request",
        message: `Farmer needs help with ${schedule.cropName}: ${query.substring(0, 100)}...`,
        data: {
          scheduleId: schedule._id,
          consultationId: consultation._id
        }
      })
    }

    res.status(201).json({
      message: "Consultation request submitted successfully",
      consultation
    })
  } catch (error) {
    console.error("Error adding consultation:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get upcoming activities for user
router.get("/activities/upcoming", auth, async (req, res) => {
  try {
    const { days = 7 } = req.query
    
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + parseInt(days))

    const schedules = await CropSchedule.find({
      farmer: req.user.id,
      status: { $in: ["Active", "Draft"] }
    })
    .populate("farm", "name location")
    .populate("crop", "name category")

    const upcomingActivities = []

    schedules.forEach(schedule => {
      const upcoming = schedule.getUpcomingActivities()
      upcoming.forEach(activity => {
        upcomingActivities.push({
          ...activity.toObject(),
          schedule: {
            id: schedule._id,
            cropName: schedule.cropName,
            variety: schedule.variety,
            farm: schedule.farm
          }
        })
      })
    })

    // Sort by scheduled date
    upcomingActivities.sort((a, b) => a.scheduledDate - b.scheduledDate)

    res.json({
      activities: upcomingActivities,
      count: upcomingActivities.length
    })
  } catch (error) {
    console.error("Error fetching upcoming activities:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get overdue activities for user
router.get("/activities/overdue", auth, async (req, res) => {
  try {
    const schedules = await CropSchedule.find({
      farmer: req.user.id,
      status: { $in: ["Active", "Draft"] }
    })
    .populate("farm", "name location")
    .populate("crop", "name category")

    const overdueActivities = []

    schedules.forEach(schedule => {
      const overdue = schedule.getOverdueActivities()
      overdue.forEach(activity => {
        overdueActivities.push({
          ...activity.toObject(),
          schedule: {
            id: schedule._id,
            cropName: schedule.cropName,
            variety: schedule.variety,
            farm: schedule.farm
          }
        })
      })
    })

    // Sort by scheduled date (oldest first)
    overdueActivities.sort((a, b) => a.scheduledDate - b.scheduledDate)

    res.json({
      activities: overdueActivities,
      count: overdueActivities.length
    })
  } catch (error) {
    console.error("Error fetching overdue activities:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete crop schedule
router.delete("/:id", auth, async (req, res) => {
  try {
    const schedule = await CropSchedule.findOne({ 
      _id: req.params.id, 
      farmer: req.user.id 
    })

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" })
    }

    schedule.isActive = false
    schedule.status = "Cancelled"
    await schedule.save()

    res.json({ message: "Schedule deleted successfully" })
  } catch (error) {
    console.error("Error deleting schedule:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
