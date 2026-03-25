const express = require("express")
const { body, validationResult } = require("express-validator")
const Farm = require("../models/Farm")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all farms for user
router.get("/", auth, async (req, res) => {
  try {
    const farms = await Farm.find({ 
      owner: req.user.id,
      isActive: true 
    }).sort({ createdAt: -1 })

    res.json(farms)
  } catch (error) {
    console.error("Error fetching farms:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get single farm
router.get("/:id", auth, async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate("owner", "name email")

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    res.json(farm)
  } catch (error) {
    console.error("Error fetching farm:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create farm
router.post(
  "/",
  auth,
  [
    body("name").notEmpty().withMessage("Farm name is required"),
    body("location").notEmpty().withMessage("Location is required"),
    body("area.value").isNumeric().withMessage("Area must be a number"),
    body("soilType").notEmpty().withMessage("Soil type is required"),
    body("irrigationType").notEmpty().withMessage("Irrigation type is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const {
        name,
        location,
        coordinates,
        area,
        soilType,
        irrigationType,
        description,
        crops,
        machinery,
        facilities
      } = req.body

      // Parse location to get coordinates if not provided
      let farmCoordinates = coordinates || [0, 0]
      if (location && !coordinates) {
        // Try to extract coordinates from location string
        const coordMatch = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
        if (coordMatch) {
          farmCoordinates = [parseFloat(coordMatch[2]), parseFloat(coordMatch[1])] // [lng, lat]
        }
      }

      const farm = new Farm({
        name,
        owner: req.user.id,
        location: {
          address: location,
          coordinates: farmCoordinates,
          district: req.body.district || "",
          state: req.body.state || "",
          country: "India"
        },
        area: {
          value: parseFloat(area.value),
          unit: area.unit || "acres"
        },
        soilType,
        irrigationType,
        description: description || "",
        crops: crops || [],
        machinery: machinery || [],
        facilities: facilities || []
      })

      await farm.save()

      // Add farm to user's farms array
      await User.findByIdAndUpdate(
        req.user.id,
        { $push: { farms: farm._id } }
      )

      res.status(201).json(farm)
    } catch (error) {
      console.error("Error creating farm:", error)
      res.status(500).json({ message: "Server error" })
    }
  }
)

// Update farm
router.put("/:id", auth, async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    const {
      name,
      location,
      coordinates,
      area,
      soilType,
      irrigationType,
      description,
      crops,
      machinery,
      facilities
    } = req.body

    // Update farm fields
    if (name) farm.name = name
    if (location) {
      farm.location.address = location
      if (coordinates) farm.location.coordinates = coordinates
    }
    if (area) {
      farm.area.value = parseFloat(area.value)
      farm.area.unit = area.unit
    }
    if (soilType) farm.soilType = soilType
    if (irrigationType) farm.irrigationType = irrigationType
    if (description !== undefined) farm.description = description
    if (crops) farm.crops = crops
    if (machinery) farm.machinery = machinery
    if (facilities) farm.facilities = facilities

    await farm.save()

    res.json(farm)
  } catch (error) {
    console.error("Error updating farm:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete farm (soft delete)
router.delete("/:id", auth, async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    // Soft delete - mark as inactive
    farm.isActive = false
    await farm.save()

    // Remove from user's farms array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { farms: farm._id } }
    )

    res.json({ message: "Farm deleted successfully" })
  } catch (error) {
    console.error("Error deleting farm:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add crop to farm
router.post("/:id/crops", auth, async (req, res) => {
  try {
    const farm = await Farm.findOne({ 
      _id: req.params.id, 
      owner: req.user.id 
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    const {
      cropId,
      cropName,
      variety,
      plantedArea,
      areaUnit,
      plantingDate,
      expectedHarvestDate,
      notes
    } = req.body

    const newCrop = {
      cropId: cropId || null,
      cropName,
      variety: variety || "",
      plantedArea: {
        value: plantedArea,
        unit: areaUnit || "acres"
      },
      plantingDate: plantingDate ? new Date(plantingDate) : new Date(),
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : null,
      currentStage: "Planted",
      status: "Healthy",
      notes: notes || ""
    }

    farm.crops.push(newCrop)
    await farm.save()

    res.status(201).json({
      message: "Crop added successfully",
      crop: newCrop,
      farm
    })
  } catch (error) {
    console.error("Error adding crop:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update crop in farm
router.put("/:farmId/crops/:cropIndex", auth, async (req, res) => {
  try {
    const farm = await Farm.findOne({ 
      _id: req.params.farmId, 
      owner: req.user.id 
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    const cropIndex = parseInt(req.params.cropIndex)
    if (cropIndex < 0 || cropIndex >= farm.crops.length) {
      return res.status(404).json({ message: "Crop not found" })
    }

    const {
      variety,
      plantedArea,
      areaUnit,
      currentStage,
      status,
      yieldExpected,
      actualYield,
      notes
    } = req.body

    const crop = farm.crops[cropIndex]
    
    if (variety) crop.variety = variety
    if (plantedArea) crop.plantedArea.value = plantedArea
    if (areaUnit) crop.plantedArea.unit = areaUnit
    if (currentStage) crop.currentStage = currentStage
    if (status) crop.status = status
    if (yieldExpected) crop.yieldExpected = yieldExpected
    if (actualYield) crop.actualYield = actualYield
    if (notes) crop.notes = notes

    await farm.save()

    res.json({
      message: "Crop updated successfully",
      crop,
      farm
    })
  } catch (error) {
    console.error("Error updating crop:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Remove crop from farm
router.delete("/:farmId/crops/:cropIndex", auth, async (req, res) => {
  try {
    const farm = await Farm.findOne({ 
      _id: req.params.farmId, 
      owner: req.user.id 
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    const cropIndex = parseInt(req.params.cropIndex)
    if (cropIndex < 0 || cropIndex >= farm.crops.length) {
      return res.status(404).json({ message: "Crop not found" })
    }

    farm.crops.splice(cropIndex, 1)
    await farm.save()

    res.json({
      message: "Crop removed successfully",
      farm
    })
  } catch (error) {
    console.error("Error removing crop:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get farm statistics
router.get("/:id/stats", auth, async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    // Import models here to avoid circular dependency
    const CropSchedule = require("../models/CropSchedule")
    const ActivityLog = require("../models/ActivityLog")

    const [schedules, activities] = await Promise.all([
      CropSchedule.find({ farm: farm._id }),
      ActivityLog.find({ farm: farm._id })
    ])

    const stats = {
      totalArea: farm.area.value,
      areaUnit: farm.area.unit,
      activeCrops: farm.crops.length,
      totalSchedules: schedules.length,
      completedSchedules: schedules.filter(s => s.status === "Completed").length,
      totalActivities: activities.length,
      totalInvestment: farm.totalInvestment,
      totalRevenue: farm.totalRevenue,
      roi: farm.calculateROI(),
      soilHealth: farm.soilHealth,
      recentActivities: activities.slice(-5).map(activity => ({
        id: activity._id,
        type: activity.activityType,
        description: activity.description,
        date: activity.date,
        cost: activity.cost
      }))
    }

    res.json(stats)
  } catch (error) {
    console.error("Error fetching farm stats:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update soil health
router.put("/:id/soil-health", auth, async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    const { pH, nitrogen, phosphorus, potassium, organicMatter } = req.body

    farm.soilHealth = {
      pH: pH || farm.soilHealth?.pH,
      nitrogen: nitrogen || farm.soilHealth?.nitrogen,
      phosphorus: phosphorus || farm.soilHealth?.phosphorus,
      potassium: potassium || farm.soilHealth?.potassium,
      organicMatter: organicMatter || farm.soilHealth?.organicMatter,
      lastTested: new Date()
    }

    await farm.save()

    res.json({
      message: "Soil health updated successfully",
      soilHealth: farm.soilHealth
    })
  } catch (error) {
    console.error("Error updating soil health:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get nearby farms
router.get("/:id/nearby", auth, async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      owner: req.user.id
    })

    if (!farm) {
      return res.status(404).json({ message: "Farm not found" })
    }

    const radius = parseInt(req.query.radius) || 10 // Default 10km
    const nearbyFarms = await farm.getNearbyFarms(radius)

    res.json(nearbyFarms)
  } catch (error) {
    console.error("Error fetching nearby farms:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
