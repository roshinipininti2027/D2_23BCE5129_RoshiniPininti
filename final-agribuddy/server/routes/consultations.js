const express = require("express")
const { body, validationResult } = require("express-validator")
const Consultation = require("../models/Consultation")
const User = require("../models/User")
const Notification = require("../models/Notification")
const auth = require("../middleware/auth")
const mongoose = require("mongoose") // Import mongoose to fix undeclared variable error
const notificationService = require("../services/notificationService")

const router = express.Router()

// Get consultations for farmer
router.get("/farmer", auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query

    const query = { farmer: req.user.id, isActive: true }
    if (status && status !== "all") {
      query.status = status
    }

    const consultations = await Consultation.find(query)
      .populate("expert", "name profile expertise")
      .populate("farm", "name location")
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Consultation.countDocuments(query)

    res.json({
      consultations,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error fetching farmer consultations:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get consultations for expert
router.get("/expert", auth, async (req, res) => {
  try {
    if (req.user.role !== "expert") {
      return res.status(403).json({ message: "Access denied. Experts only." })
    }

    const { status = "assigned", category, urgency, page = 1, limit = 20 } = req.query

    let query = { isActive: true }

    if (status === "open") {
      query.status = "open"
    } else if (status === "assigned") {
      query = {
        ...query,
        expert: req.user.id,
        status: { $in: ["assigned", "in-progress"] },
      }
    } else if (status === "resolved") {
      query = {
        ...query,
        expert: req.user.id,
        status: "resolved",
      }
    }

    if (category) query.category = category
    if (urgency) query.urgency = urgency

    const consultations = await Consultation.find(query)
      .populate("farmer", "name location profile")
      .populate("farm", "name location crops")
      .sort({ urgency: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    // Add unread message count for each consultation
    const consultationsWithUnread = consultations.map((consultation) => {
      const unreadCount = consultation.messages.filter((msg) => msg.senderRole === "farmer" && !msg.isRead).length

      return {
        ...consultation.toObject(),
        unreadMessagesCount: unreadCount,
      }
    })

    const total = await Consultation.countDocuments(query)

    res.json({
      consultations: consultationsWithUnread,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error fetching expert consultations:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create new consultation
router.post(
  "/",
  [
    auth,
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("category")
      .isIn([
        "crop-management",
        "pest-control",
        "disease-management",
        "soil-health",
        "irrigation",
        "fertilization",
        "weather-related",
        "market-information",
        "equipment",
        "general",
      ])
      .withMessage("Valid category is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { title, description, category, urgency, farmId, cropId, attachments, location } = req.body

      const consultation = new Consultation({
        farmer: req.user.id,
        title,
        description,
        category,
        urgency: urgency || "medium",
        farm: farmId,
        crop: cropId,
        attachments: attachments || [],
        location: location || {},
        status: "open",
      })

      await consultation.save()

      await consultation.populate([
        { path: "farmer", select: "name location profile" },
        { path: "farm", select: "name location crops" },
      ])

      // Create notifications for relevant experts
      const experts = await User.findExpertsByExpertise(category, 5)

      const notifications = experts.map((expert) => ({
        recipient: expert._id,
        sender: req.user.id,
        type: "consultation_request",
        category: "info",
        priority: urgency === "critical" ? "high" : "medium",
        title: "New Consultation Request",
        message: `New ${category} query: ${title}`,
        data: {
          consultationId: consultation._id,
          category,
          urgency,
        },
        channels: ["in_app", "push"],
      }))

      if (notifications.length > 0) {
        await Notification.insertMany(notifications)
      }

      res.status(201).json({
        message: "Consultation created successfully",
        consultation,
      })
    } catch (error) {
      console.error("Error creating consultation:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get single consultation
router.get("/:id", auth, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate("farmer", "name location profile")
      .populate("expert", "name profile expertise")
      .populate("farm", "name location crops")

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" })
    }

    // Check if user has access to this consultation
    if (
      consultation.farmer._id.toString() !== req.user.id &&
      consultation.expert?._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Mark messages as read for the current user
    const userRole = req.user.role === "expert" ? "expert" : "farmer"
    await consultation.markMessagesAsRead(userRole)

    res.json(consultation)
  } catch (error) {
    console.error("Error fetching consultation:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Add message to consultation
router.post(
  "/:id/messages",
  [auth, body("content").notEmpty().withMessage("Message content is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const consultation = await Consultation.findById(req.params.id)
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" })
      }

      const user = await User.findById(req.user.id)
      const { content, attachments } = req.body

      // Check if user can add messages
      const isOwner = consultation.farmer.toString() === req.user.id
      const isExpert = consultation.expert && consultation.expert.toString() === req.user.id
      const canRespond = user.role === "expert" && consultation.status === "open"

      if (!isOwner && !isExpert && !canRespond) {
        return res.status(403).json({ message: "Access denied" })
      }

      // Add message
      await consultation.addMessage(req.user.id, user.role, content.trim(), attachments || [])

      // Create notification for the other party
      const recipientId = user.role === "farmer" ? consultation.expert : consultation.farmer
      if (recipientId) {
        await notificationService.sendConsultationNotification(recipientId, req.user.id, {
          message: content.trim(),
          consultationId: consultation._id,
          senderRole: user.role,
        })
      }

      res.json({
        message: "Message added successfully",
        consultation,
      })
    } catch (error) {
      console.error("Error adding message:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Assign expert to consultation
router.post("/:id/assign", auth, async (req, res) => {
  try {
    if (req.user.role !== "expert") {
      return res.status(403).json({ message: "Access denied. Experts only." })
    }

    const consultation = await Consultation.findById(req.params.id)
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" })
    }

    if (consultation.status !== "open") {
      return res.status(400).json({ message: "Consultation is not available for assignment" })
    }

    await consultation.assignToExpert(req.user.id)

    // Send notification to farmer
    await notificationService.sendConsultationNotification(consultation.farmer, req.user.id, {
      message: `Your consultation "${consultation.title}" has been assigned to an expert and will be reviewed soon.`,
      consultationId: consultation._id,
      senderRole: "expert",
    })

    res.json({ message: "Expert assigned successfully" })
  } catch (error) {
    console.error("Error assigning expert:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Resolve consultation
router.post(
  "/:id/resolve",
  [auth, body("summary").notEmpty().withMessage("Resolution summary is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const consultation = await Consultation.findById(req.params.id)
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" })
      }

      const user = await User.findById(req.user.id)
      if (!user || user.role !== "expert") {
        return res.status(403).json({ message: "Access denied. Experts only." })
      }

      // Check if expert is assigned to this consultation
      if (consultation.expert && consultation.expert.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not assigned to this consultation" })
      }

      const { summary, recommendations } = req.body

      // Resolve consultation
      await consultation.resolve(req.user.id, summary.trim(), recommendations || [])

      // Update expert stats
      const expert = await User.findById(req.user.id)
      expert.expertise.consultationsHandled += 1

      // Update response time if this was the first expert response
      if (consultation.responseTime) {
        expert.updateResponseTime(consultation.responseTime)
      }

      await expert.save()

      // Send notification to farmer
      await notificationService.sendConsultationNotification(consultation.farmer, req.user.id, {
        message: `Your consultation "${consultation.title}" has been resolved. Please check the resolution and provide feedback.`,
        consultationId: consultation._id,
        senderRole: "expert",
      })

      res.json({ message: "Consultation resolved successfully" })
    } catch (error) {
      console.error("Error resolving consultation:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Add feedback to consultation
router.post(
  "/:id/feedback",
  [auth, body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const consultation = await Consultation.findById(req.params.id)
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" })
      }

      if (consultation.farmer.toString() !== req.user.id) {
        return res.status(403).json({ message: "Only the farmer can provide feedback" })
      }

      if (consultation.status !== "resolved") {
        return res.status(400).json({ message: "Can only provide feedback for resolved consultations" })
      }

      const { rating, comment } = req.body

      await consultation.addFeedback(rating, comment || "")

      // Update expert rating
      if (consultation.expert) {
        const expert = await User.findById(consultation.expert)
        await expert.updateExpertRating(rating)
      }

      res.json({ message: "Feedback submitted successfully" })
    } catch (error) {
      console.error("Error adding feedback:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get consultation statistics
router.get("/stats/overview", auth, async (req, res) => {
  try {
    if (req.user.role !== "expert") {
      return res.status(403).json({ message: "Access denied. Experts only." })
    }

    const stats = await Consultation.aggregate([
      {
        $match: {
          $or: [{ expert: req.user.id }, { status: "open" }],
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } },
          assigned: { $sum: { $cond: [{ $eq: ["$status", "assigned"] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
          avgResponseTime: { $avg: "$responseTime" },
          ratings: { $push: "$feedback.rating" },
        },
      },
    ])

    const result = stats[0] || {
      total: 0,
      open: 0,
      assigned: 0,
      inProgress: 0,
      resolved: 0,
      avgResponseTime: 0,
      ratings: [],
    }

    // Calculate average rating
    const validRatings = result.ratings.filter((r) => r != null)
    const avgRating =
      validRatings.length > 0 ? validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length : 0

    res.json({
      total: result.total,
      inProgress: result.assigned + result.inProgress,
      resolved: result.resolved,
      avgRating: Number.parseFloat(avgRating.toFixed(1)),
      avgResponseTime: result.avgResponseTime || 0,
    })
  } catch (error) {
    console.error("Error fetching consultation stats:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
