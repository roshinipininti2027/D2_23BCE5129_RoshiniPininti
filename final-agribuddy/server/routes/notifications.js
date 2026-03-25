const express = require("express")
const Notification = require("../models/Notification")
const auth = require("../middleware/auth")
const mongoose = require("mongoose")

const router = express.Router()

// Get notifications for user
router.get("/", auth, async (req, res) => {
  try {
    const { status = "all", type, category, page = 1, limit = 20 } = req.query

    const query = {
      recipient: req.user.id,
      ...(status !== "all" && { status }),
      ...(type && { type }),
      ...(category && { category }),
    }

    const notifications = await Notification.find(query)
      .populate("sender", "name role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Notification.countDocuments(query)
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      status: "unread",
    })

    res.json({
      notifications,
      unreadCount,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    notification.status = "read"
    notification.readAt = new Date()
    await notification.save()

    res.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark all notifications as read
router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.id,
        status: "unread",
      },
      {
        status: "read",
        readAt: new Date(),
      },
    )

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete notification
router.delete("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    })

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    res.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get notification preferences
router.get("/preferences", auth, async (req, res) => {
  try {
    const User = require("../models/User")
    const user = await User.findById(req.user.id).select("preferences.notifications")

    res.json(
      user.preferences.notifications || {
        weather: true,
        activities: true,
        schedules: true,
        consultations: true,
        advisories: true,
      },
    )
  } catch (error) {
    console.error("Error fetching notification preferences:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update notification preferences
router.put("/preferences", auth, async (req, res) => {
  try {
    const User = require("../models/User")
    const { notifications } = req.body

    await User.findByIdAndUpdate(req.user.id, { "preferences.notifications": notifications }, { new: true })

    res.json({ message: "Notification preferences updated successfully" })
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get notification statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const stats = await Notification.aggregate([
      { $match: { recipient: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ["$status", "unread"] }, 1, 0] } },
          byType: {
            $push: {
              type: "$type",
              status: "$status",
            },
          },
        },
      },
    ])

    const typeStats = {}
    if (stats[0]) {
      stats[0].byType.forEach((item) => {
        if (!typeStats[item.type]) {
          typeStats[item.type] = { total: 0, unread: 0 }
        }
        typeStats[item.type].total += 1
        if (item.status === "unread") {
          typeStats[item.type].unread += 1
        }
      })
    }

    res.json({
      total: stats[0]?.total || 0,
      unread: stats[0]?.unread || 0,
      byType: typeStats,
    })
  } catch (error) {
    console.error("Error fetching notification stats:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create test notification (for development)
router.post("/test", auth, async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ message: "Not available in production" })
    }

    const notification = await Notification.create({
      recipient: req.user.id,
      type: "system_notification",
      category: "info",
      priority: "low",
      title: "Test Notification",
      message: "This is a test notification to verify the system is working correctly.",
      data: { test: true },
      channels: ["in_app"],
      status: "unread",
    })

    res.json({ message: "Test notification created", notification })
  } catch (error) {
    console.error("Error creating test notification:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
