const express = require("express")
const Crop = require("../models/Crop")
const auth = require("../middleware/auth")

const router = express.Router()

// Get all crops with filtering and pagination
router.get("/", auth, async (req, res) => {
  try {
    const {
      category,
      difficulty,
      season,
      soilType,
      state,
      search,
      page = 1,
      limit = 20,
      sortBy = "name",
      sortOrder = "asc"
    } = req.query

    // Build query
    const query = { isActive: true }
    
    if (category) query.category = category
    if (difficulty) query.difficulty = difficulty
    if (season) query["plantingDetails.season"] = season
    if (soilType) query["soilRequirements.types"] = soilType
    if (state) query["suitableRegions.state"] = state
    if (search) {
      query.$text = { $search: search }
    }

    // Build sort object
    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query with pagination
    const crops = await Crop.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v")

    const total = await Crop.countDocuments(query)

    res.json({
      crops,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error("Error fetching crops:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get crop by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)

    if (!crop || !crop.isActive) {
      return res.status(404).json({ message: "Crop not found" })
    }

    res.json(crop)
  } catch (error) {
    console.error("Error fetching crop:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get crop recommendations based on conditions
router.post("/recommendations", auth, async (req, res) => {
  try {
    const {
      soilType,
      season,
      state,
      district,
      farmSize,
      experience,
      budget,
      waterAvailability,
      marketAccess
    } = req.body

    const conditions = {}
    if (soilType) conditions.soilType = soilType
    if (season) conditions.season = season
    if (state) conditions.state = state

    const recommendations = await Crop.findSuitableCrops(conditions)

    // Score and rank recommendations
    const scoredRecommendations = recommendations.map(crop => {
      let score = crop.economicAspects.profitability * 20
      
      // Adjust score based on difficulty and farmer experience
      if (experience === "beginner" && crop.difficulty === "easy") score += 15
      if (experience === "intermediate" && crop.difficulty === "medium") score += 10
      if (experience === "expert" && crop.difficulty === "hard") score += 5
      
      // Market demand factor
      score += crop.economicAspects.marketDemand * 10
      
      return {
        ...crop.toObject(),
        recommendationScore: Math.min(100, score),
        reasons: [
          `Suitable for ${soilType} soil`,
          `Good for ${season} season`,
          `High market demand`,
          `Matches your experience level`
        ]
      }
    })

    // Sort by recommendation score
    scoredRecommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)

    res.json({
      recommendations: scoredRecommendations.slice(0, 10),
      criteria: req.body,
      totalFound: scoredRecommendations.length
    })
  } catch (error) {
    console.error("Error getting crop recommendations:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get crop categories
router.get("/categories/list", auth, async (req, res) => {
  try {
    const categories = await Crop.distinct("category", { isActive: true })
    
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await Crop.countDocuments({ category, isActive: true })
        return { category, count }
      })
    )

    res.json(categoryStats)
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get crop varieties for a specific crop
router.get("/:id/varieties", auth, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id).select("varieties name")
    
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" })
    }

    res.json({
      cropName: crop.name,
      varieties: crop.varieties
    })
  } catch (error) {
    console.error("Error fetching varieties:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get crop calendar for specific crop and location
router.get("/:id/calendar", auth, async (req, res) => {
  try {
    const { state, district } = req.query
    const crop = await Crop.findById(req.params.id)
    
    if (!crop) {
      return res.status(404).json({ message: "Crop not found" })
    }

    // Generate calendar based on crop growth stages and local conditions
    const calendar = crop.growthStages.map((stage, index) => {
      const startDay = crop.growthStages.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
      const endDay = startDay + stage.duration

      return {
        stage: stage.stage,
        startDay,
        endDay,
        duration: stage.duration,
        description: stage.description,
        activities: stage.activities,
        criticalFactors: stage.criticalFactors,
        commonProblems: stage.commonProblems
      }
    })

    res.json({
      cropName: crop.name,
      totalDuration: crop.harvestDetails.maturityDays,
      calendar,
      plantingMonths: crop.plantingDetails.plantingMonths,
      harvestingMonths: crop.harvestDetails.harvestingMonths
    })
  } catch (error) {
    console.error("Error fetching crop calendar:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new crop (Admin only - for demo, any authenticated user can create)
router.post("/", auth, async (req, res) => {
  try {
    const crop = new Crop(req.body)
    await crop.save()
    
    res.status(201).json({
      message: "Crop created successfully",
      crop
    })
  } catch (error) {
    console.error("Error creating crop:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update crop (Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" })
    }

    res.json({
      message: "Crop updated successfully",
      crop
    })
  } catch (error) {
    console.error("Error updating crop:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete crop (Admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" })
    }

    res.json({ message: "Crop deleted successfully" })
  } catch (error) {
    console.error("Error deleting crop:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
