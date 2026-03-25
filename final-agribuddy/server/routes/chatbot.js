const express = require("express")
const auth = require("../middleware/auth")
const chatBotService = require("../services/chatBotService")

const router = express.Router()

// Start new chat session
router.post("/start", auth, async (req, res) => {
  try {
    const result = await chatBotService.startSession(req.user.id)
    res.json(result)
  } catch (error) {
    console.error("Error starting chat session:", error)
    res.status(500).json({ message: "Failed to start chat session" })
  }
})

// Send message
router.post("/message", auth, async (req, res) => {
  try {
    const { message, sessionId } = req.body

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" })
    }

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" })
    }

    const result = await chatBotService.processMessage(sessionId, message.trim(), req.user.id)

    res.json(result)
  } catch (error) {
    console.error("Error processing message:", error)
    res.status(500).json({
      message: "Failed to process message",
      response: "I'm sorry, I'm having trouble processing your request. Please try again.",
      responseType: "text",
      quickReplies: ["Try Again", "Talk to Expert"],
    })
  }
})

// Escalate to expert
router.post("/escalate", auth, async (req, res) => {
  try {
    const { sessionId, reason } = req.body

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" })
    }

    const result = await chatBotService.escalateToExpert(sessionId, reason || "User requested expert assistance")

    res.json(result)
  } catch (error) {
    console.error("Error escalating to expert:", error)
    res.status(500).json({
      success: false,
      message: "Failed to connect with expert. Please try again later.",
    })
  }
})

// Submit feedback
router.post("/feedback", auth, async (req, res) => {
  try {
    const { sessionId, helpful, rating, comment } = req.body

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" })
    }

    await chatBotService.addFeedback(sessionId, helpful, rating, comment)
    res.json({ message: "Feedback submitted successfully" })
  } catch (error) {
    console.error("Error submitting feedback:", error)
    res.status(500).json({ message: "Failed to submit feedback" })
  }
})

// Get chat history
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const ChatBot = require("../models/ChatBot")

    const sessions = await ChatBot.find({
      user: req.user.id,
      isActive: false,
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("sessionId messages.timestamp messages.sender messages.message createdAt endedAt")

    const total = await ChatBot.countDocuments({
      user: req.user.id,
      isActive: false,
    })

    res.json({
      sessions,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
    })
  } catch (error) {
    console.error("Error fetching chat history:", error)
    res.status(500).json({ message: "Failed to fetch chat history" })
  }
})

module.exports = router
