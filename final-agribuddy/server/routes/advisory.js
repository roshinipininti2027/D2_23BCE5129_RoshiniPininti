const express = require("express")
const Advisory = require("../models/Advisory")
const User = require("../models/User")
const Notification = require("../models/Notification")
const auth = require("../middleware/auth")
const { body, validationResult } = require("express-validator")

const router = express.Router()

// Get all active advisories
router.get("/", auth, async (req, res) => {
  try {
    const { 
      type, 
      priority, 
      category,
      page = 1, 
      limit = 20,
      search,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query

    const query = {
      status: "Published",
      isActive: true,
      "validityPeriod.endDate": { $gte: new Date() }
    }

    if (type) query.type = type
    if (priority) query.priority = priority
    if (category) query.category = category
    if (search) {
      query.$text = { $search: search }
    }

    // Get user for personalized filtering
    const user = await User.findById(req.user.id)
    if (user && user.location && user.location.state) {
      query.$or = [
        { "targetAudience.regions.state": user.location.state },
        { "targetAudience.regions": { $size: 0 } }
      ]
    }

    const sort = {}
    sort[sortBy] = sortOrder === "desc" ? -1 : 1

    const advisories = await Advisory.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("author", "name authorInfo.designation authorInfo.organization")
      .select("-feedback -analytics.views")

    const total = await Advisory.countDocuments(query)

    // Update view count for each advisory
    const advisoryIds = advisories.map(advisory => advisory._id)
    await Advisory.updateMany(
      { _id: { $in: advisoryIds } },
      { $inc: { "analytics.views": 1 } }
    )

    res.json({
      advisories,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error("Error fetching advisories:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get advisory by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id)
      .populate("author", "name authorInfo expertise")
      .populate("feedback.farmer", "name location.state")

    if (!advisory || !advisory.isActive) {
      return res.status(404).json({ message: "Advisory not found" })
    }

    // Update view count
    advisory.analytics.views += 1
    await advisory.save()

    res.json(advisory)
  } catch (error) {
    console.error("Error fetching advisory:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create advisory (Experts only)
router.post("/", [
  auth,
  body("title").notEmpty().withMessage("Title is required"),
  body("content").notEmpty().withMessage("Content is required"),
  body("type").isIn(["Weather", "Pest", "Disease", "Fertilizer", "Irrigation", "Market", "General", "Emergency"]).withMessage("Valid type is required"),
  body("validityPeriod.endDate").isISO8601().withMessage("Valid end date is required")
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    // Check if user is an expert
    const user = await User.findById(req.user.id)
    if (!user || user.role !== "expert") {
      return res.status(403).json({ message: "Only experts can create advisories" })
    }

    const {
      title,
      content,
      summary,
      type,
      category,
      priority,
      severity,
      targetAudience,
      validityPeriod,
      weather,
      actionItems,
      resources,
      multimedia,
      translations,
      scientificBasis,
      implementation,
      impact,
      tags
    } = req.body

    const advisory = new Advisory({
      title,
      content,
      summary: summary || content.substring(0, 200),
      type,
      category: category || "Advisory",
      priority: priority || "Medium",
      severity: severity || "Info",
      targetAudience: targetAudience || {},
      author: req.user.id,
      authorInfo: {
        name: user.name,
        designation: user.authorInfo?.designation || "Agricultural Expert",
        organization: user.authorInfo?.organization || "AgriBuddy",
        expertise: user.expertise || []
      },
      validityPeriod: {
        startDate: validityPeriod.startDate ? new Date(validityPeriod.startDate) : new Date(),
        endDate: new Date(validityPeriod.endDate)
      },
      weather: weather || {},
      actionItems: actionItems || [],
      resources: resources || [],
      multimedia: multimedia || {},
      translations: translations || [],
      scientificBasis: scientificBasis || {},
      implementation: implementation || {},
      impact: impact || {},
      tags: tags || [],
      status: "Published"
    })

    await advisory.save()

    // Create notifications for relevant farmers
    const farmers = await User.find({ 
      role: "farmer",
      "preferences.notifications.advisory": true
    })

    const notifications = farmers.map(farmer => ({
      recipient: farmer._id,
      sender: req.user.id,
      type: "advisory",
      category: severity.toLowerCase(),
      priority: priority.toLowerCase(),
      title: `New ${type} Advisory`,
      message: `${title.substring(0, 100)}...`,
      data: {
        advisoryId: advisory._id,
        advisoryType: type
      },
      channels: ["in_app", "push"]
    }))

    await Notification.insertMany(notifications)

    res.status(201).json({
      message: "Advisory created successfully",
      advisory
    })
  } catch (error) {
    console.error("Error creating advisory:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update advisory (Author or Admin only)
router.put("/:id", auth, async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id)
    if (!advisory) {
      return res.status(404).json({ message: "Advisory not found" })
    }

    // Check if user is the author
    if (advisory.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this advisory" })
    }

    const {
      title,
      content,
      summary,
      priority,
      severity,
      targetAudience,
      validityPeriod,
      actionItems,
      resources,
      tags,
      status
    } = req.body

    // Update fields
    if (title) advisory.title = title
    if (content) advisory.content = content
    if (summary) advisory.summary = summary
    if (priority) advisory.priority = priority
    if (severity) advisory.severity = severity
    if (targetAudience) advisory.targetAudience = { ...advisory.targetAudience, ...targetAudience }
    if (validityPeriod) {
      if (validityPeriod.endDate) advisory.validityPeriod.endDate = new Date(validityPeriod.endDate)
    }
    if (actionItems) advisory.actionItems = actionItems
    if (resources) advisory.resources = resources
    if (tags) advisory.tags = tags
    if (status) advisory.status = status

    await advisory.save()

    res.json({
      message: "Advisory updated successfully",
      advisory
    })
  } catch (error) {
    console.error("Error updating advisory:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add feedback to advisory
router.post("/:id/feedback", auth, async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id)
    if (!advisory) {
      return res.status(404).json({ message: "Advisory not found" })
    }

    const { rating, comment, implementation } = req.body

    const feedback = {
      farmer: req.user.id,
      rating: parseInt(rating),
      comment,
      implementation: implementation || {}
    }

    advisory.feedback.push(feedback)
    
    // Update analytics
    advisory.calculateAverageRating()
    if (implementation && implementation.attempted) {
      advisory.analytics.implementations += 1
      if (implementation.successful) {
        advisory.analytics.successRate = 
          (advisory.analytics.successRate * (advisory.analytics.implementations - 1) + 100) / 
          advisory.analytics.implementations
      }
    }

    await advisory.save()

    // Create notification for advisory author
    await Notification.create({
      recipient: advisory.author,
      sender: req.user.id,
      type: "advisory",
      category: "info",
      priority: "low",
      title: "Advisory Feedback Received",
      message: `A farmer has provided feedback on your advisory: ${advisory.title}`,
      data: {
        advisoryId: advisory._id,
        rating: rating
      }
    })

    res.status(201).json({
      message: "Feedback added successfully",
      feedback,
      averageRating: advisory.analytics.averageRating
    })
  } catch (error) {
    console.error("Error adding feedback:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get advisories by expert
router.get("/expert/:expertId", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    
    const advisories = await Advisory.find({
      author: req.params.expertId,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate("author", "name authorInfo")

    const total = await Advisory.countDocuments({
      author: req.params.expertId,
      isActive: true
    })

    res.json({
      advisories,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    })
  } catch (error) {
    console.error("Error fetching expert advisories:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get advisory categories and types
router.get("/meta/categories", auth, async (req, res) => {
  try {
    const [types, categories, priorities] = await Promise.all([
      Advisory.distinct("type", { isActive: true, status: "Published" }),
      Advisory.distinct("category", { isActive: true, status: "Published" }),
      Advisory.distinct("priority", { isActive: true, status: "Published" })
    ])

    const typeStats = await Promise.all(
      types.map(async (type) => {
        const count = await Advisory.countDocuments({ 
          type, 
          isActive: true, 
          status: "Published" 
        })
        return { type, count }
      })
    )

    res.json({
      types: typeStats,
      categories,
      priorities
    })
  } catch (error) {
    console.error("Error fetching advisory categories:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get trending advisories
router.get("/trending/popular", auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query
    
    const trendingAdvisories = await Advisory.find({
      status: "Published",
      isActive: true,
      "validityPeriod.endDate": { $gte: new Date() },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
    .sort({ 
      "analytics.views": -1, 
      "analytics.shares": -1, 
      "analytics.averageRating": -1 
    })
    .limit(parseInt(limit))
    .populate("author", "name authorInfo.designation")
    .select("title summary type priority analytics createdAt author")

    res.json({
      trending: trendingAdvisories
    })
  } catch (error) {
    console.error("Error fetching trending advisories:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Share advisory
router.post("/:id/share", auth, async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id)
    if (!advisory) {
      return res.status(404).json({ message: "Advisory not found" })
    }

    // Update share count
    advisory.analytics.shares += 1
    await advisory.save()

    res.json({
      message: "Advisory shared successfully",
      shareCount: advisory.analytics.shares
    })
  } catch (error) {
    console.error("Error sharing advisory:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete advisory (Author only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id)
    if (!advisory) {
      return res.status(404).json({ message: "Advisory not found" })
    }

    // Check if user is the author
    if (advisory.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this advisory" })
    }

    advisory.isActive = false
    advisory.status = "Archived"
    await advisory.save()

    res.json({ message: "Advisory deleted successfully" })
  } catch (error) {
    console.error("Error deleting advisory:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
