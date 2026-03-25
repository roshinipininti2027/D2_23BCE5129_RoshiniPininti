const express = require("express")
const { body, validationResult } = require("express-validator")
const CropDiary = require("../models/CropDiary")
const Farm = require("../models/Farm")
const auth = require("../middleware/auth")
const mongoose = require("mongoose") // Import mongoose to use ObjectId
const notificationService = require("../services/notificationService")

const router = express.Router()

// Get all crop diaries for farmer
router.get("/", auth, async (req, res) => {
  try {
    const { status, crop, season, search, page = 1, limit = 12 } = req.query

    const query = { farmer: req.user.id, isActive: true }

    if (status && status !== "all") {
      query.status = status
    }

    if (crop) {
      query["crop.name"] = new RegExp(crop, "i")
    }

    if (season) {
      query["crop.season"] = season
    }

    if (search) {
      query.$or = [{ "crop.name": new RegExp(search, "i") }, { "crop.variety": new RegExp(search, "i") }]
    }

    const diaries = await CropDiary.find(query)
      .populate("farm", "name location")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await CropDiary.countDocuments(query)

    res.json({
      diaries,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error fetching crop diaries:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single crop diary
router.get("/:id", auth, async (req, res) => {
  try {
    const diary = await CropDiary.findOne({
      _id: req.params.id,
      farmer: req.user.id,
      isActive: true,
    }).populate("farm", "name location")

    if (!diary) {
      return res.status(404).json({ message: "Crop diary not found" })
    }

    res.json(diary)
  } catch (error) {
    console.error("Error fetching crop diary:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new crop diary
router.post("/", auth, async (req, res) => {
  try {
    const { farmId, crop, area, plantingDate, expectedHarvestDate, soilData, notes } = req.body

    // Verify farm belongs to user
    const farm = await Farm.findOne({
      _id: farmId,
      owner: req.user.id,
      isActive: true,
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    const diary = await CropDiary.create({
      farmer: req.user.id,
      farm: farmId,
      crop,
      area,
      plantingDate: new Date(plantingDate),
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
      soilData,
      notes,
      currentStage: {
        name: "land-preparation",
        startDate: new Date(),
        status: "in-progress",
      },
    })

    await diary.populate("farm", "name location")

    // Send welcome notification
    await notificationService.sendCustomNotification(req.user.id, {
      type: "diary_reminder",
      category: "info",
      priority: "low",
      title: "Crop Diary Created",
      message: `Your crop diary for ${crop.name} has been created successfully. Start logging your daily activities to track progress.`,
      data: {
        diaryId: diary._id,
        cropName: crop.name,
      },
    })

    res.status(201).json({
      message: "Crop diary created successfully",
      diary,
    })
  } catch (error) {
    console.error("Error creating crop diary:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update crop diary
router.put("/:id", auth, async (req, res) => {
  try {
    const diary = await CropDiary.findOne({
      _id: req.params.id,
      farmer: req.user.id,
      isActive: true,
    })

    if (!diary) {
      return res.status(404).json({ message: "Crop diary not found" })
    }

    const allowedUpdates = ["crop", "area", "expectedHarvestDate", "soilData", "notes", "currentStage"]

    const updates = {}
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key]
      }
    })

    Object.assign(diary, updates)
    await diary.save()

    res.json({
      message: "Crop diary updated successfully",
      diary,
    })
  } catch (error) {
    console.error("Error updating crop diary:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add activity to crop diary
router.post("/:id/activities", auth, async (req, res) => {
  try {
    const diary = await CropDiary.findOne({
      _id: req.params.id,
      farmer: req.user.id,
      isActive: true,
    })

    if (!diary) {
      return res.status(404).json({ message: "Crop diary not found" })
    }

    const activityData = {
      date: new Date(req.body.date || Date.now()),
      type: req.body.type,
      description: req.body.description,
      cost: req.body.cost || { amount: 0, currency: "INR" },
      labor: req.body.labor || {},
      materials: req.body.materials || [],
      weather: req.body.weather || {},
      images: req.body.images || [],
      notes: req.body.notes || "",
    }

    await diary.addActivity(activityData)

    res.json({
      message: "Activity added successfully",
      diary,
    })
  } catch (error) {
    console.error("Error adding activity:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update crop stage
router.put("/:id/stage", auth, async (req, res) => {
  try {
    const { stage } = req.body

    if (!stage) {
      return res.status(400).json({ message: "Stage is required" })
    }

    const diary = await CropDiary.findOne({
      _id: req.params.id,
      farmer: req.user.id,
      isActive: true,
    })

    if (!diary) {
      return res.status(404).json({ message: "Crop diary not found" })
    }

    await diary.updateStage(stage)

    // Send stage update notification
    await notificationService.sendCustomNotification(req.user.id, {
      type: "crop_stage_update",
      category: "info",
      priority: "low",
      title: "Crop Stage Updated",
      message: `Your ${diary.crop.name} has progressed to ${stage.replace("-", " ")} stage.`,
      data: {
        diaryId: diary._id,
        cropName: diary.crop.name,
        stage: stage,
      },
    })

    res.json({
      message: "Crop stage updated successfully",
      diary,
    })
  } catch (error) {
    console.error("Error updating crop stage:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Record harvest
router.post("/:id/harvest", auth, async (req, res) => {
  try {
    const diary = await CropDiary.findOne({
      _id: req.params.id,
      farmer: req.user.id,
      isActive: true,
    })

    if (!diary) {
      return res.status(404).json({ message: "Crop diary not found" })
    }

    const harvestData = {
      date: new Date(req.body.date || Date.now()),
      quantity: req.body.quantity,
      unit: req.body.unit,
      quality: req.body.quality,
      revenue: req.body.revenue,
    }

    await diary.recordHarvest(harvestData)

    // Send harvest completion notification
    await notificationService.sendCustomNotification(req.user.id, {
      type: "crop_stage_update",
      category: "info",
      priority: "medium",
      title: "Harvest Recorded",
      message: `Congratulations! You've successfully recorded the harvest for your ${diary.crop.name}. Total yield: ${harvestData.quantity} ${harvestData.unit}`,
      data: {
        diaryId: diary._id,
        cropName: diary.crop.name,
        yield: harvestData,
      },
    })

    res.json({
      message: "Harvest recorded successfully",
      diary,
    })
  } catch (error) {
    console.error("Error recording harvest:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add challenge
router.post("/:id/challenges", auth, async (req, res) => {
  try {
    const diary = await CropDiary.findOne({
      _id: req.params.id,
      farmer: req.user.id,
      isActive: true,
    })

    if (!diary) {
      return res.status(404).json({ message: "Crop diary not found" })
    }

    const challengeData = {
      type: req.body.type,
      description: req.body.description,
      severity: req.body.severity || "medium",
    }

    await diary.addChallenge(challengeData)

    res.json({
      message: "Challenge added successfully",
      diary,
    })
  } catch (error) {
    console.error("Error adding challenge:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get dashboard summary
router.get("/dashboard/summary", auth, async (req, res) => {
  try {
    const summaryData = await CropDiary.getDashboardSummary(req.user.id)
    const summary = summaryData[0] || {
      activeDiaries: 0,
      completedDiaries: 0,
      totalInvestment: 0,
      totalRevenue: 0,
      totalProfit: 0,
    }

    // Get active crops for quick overview
    const activeCrops = await CropDiary.find({
      farmer: req.user.id,
      status: "active",
      isActive: true,
    })
      .populate("farm", "name location")
      .sort({ plantingDate: -1 })
      .limit(5)

    // Get recent activities
    const recentActivities = await CropDiary.aggregate([
      { $match: { farmer: req.user.id, isActive: true } },
      { $unwind: "$activities" },
      { $sort: { "activities.createdAt": -1 } },
      { $limit: 10 },
      {
        $project: {
          cropName: "$crop.name",
          activityType: "$activities.type",
          description: "$activities.description",
          date: "$activities.date",
          cost: "$activities.cost.amount",
        },
      },
    ])

    res.json({
      activeDiaries: summary.activeDiaries,
      completedDiaries: summary.completedDiaries,
      totalInvestment: summary.totalInvestment,
      totalRevenue: summary.totalRevenue,
      profit: summary.totalProfit,
      activeCrops,
      recentActivities,
    })
  } catch (error) {
    console.error("Error fetching dashboard summary:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Export crop diary
router.get("/:id/export", auth, async (req, res) => {
  try {
    const diary = await CropDiary.findOne({
      _id: req.params.id,
      farmer: req.user.id,
      isActive: true,
    }).populate("farm", "name location")

    if (!diary) {
      return res.status(404).json({ message: "Crop diary not found" })
    }

    // Prepare export data
    const exportData = {
      cropInfo: {
        "Crop Name": diary.crop.name,
        Variety: diary.crop.variety,
        Season: diary.crop.season,
        Farm: diary.farm.name,
        Area: `${diary.area.value} ${diary.area.unit}`,
        "Planting Date": diary.plantingDate.toDateString(),
        "Expected Harvest": diary.expectedHarvestDate ? diary.expectedHarvestDate.toDateString() : "Not set",
        "Actual Harvest": diary.actualHarvestDate ? diary.actualHarvestDate.toDateString() : "Not harvested",
        Status: diary.status,
        "Days Since Planting": diary.daysSincePlanting,
      },
      activities: diary.activities.map((activity) => ({
        Date: activity.date.toDateString(),
        Type: activity.type,
        Description: activity.description,
        Cost: activity.cost.amount,
        Weather: activity.weather.conditions || "Not recorded",
        Notes: activity.notes || "None",
      })),
      economics: {
        "Total Investment": diary.economics.totalInvestment,
        "Total Revenue": diary.economics.revenue.totalRevenue,
        Profit: diary.economics.profit,
        ROI: `${diary.economics.roi.toFixed(2)}%`,
        Breakdown: diary.economics.breakdown,
      },
    }

    res.json({
      message: "Export data prepared successfully",
      data: exportData,
    })
  } catch (error) {
    console.error("Error exporting crop diary:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete crop diary
router.delete("/:id", auth, async (req, res) => {
  try {
    const diary = await CropDiary.findOne({
      _id: req.params.id,
      farmer: req.user.id,
      isActive: true,
    })

    if (!diary) {
      return res.status(404).json({ message: "Crop diary not found" })
    }

    diary.isActive = false
    await diary.save()

    res.json({ message: "Crop diary deleted successfully" })
  } catch (error) {
    console.error("Error deleting crop diary:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
