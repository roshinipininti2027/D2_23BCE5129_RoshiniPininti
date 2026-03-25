const mongoose = require("mongoose")

const chatBotSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["user", "bot"],
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        responseType: {
          type: String,
          enum: ["text", "quick_reply", "card", "list"],
          default: "text",
        },
        quickReplies: [String],
        cards: [
          {
            title: String,
            subtitle: String,
            imageUrl: String,
            buttons: [
              {
                title: String,
                payload: String,
                url: String,
              },
            ],
          },
        ],
        intent: String,
        confidence: Number,
        entities: [
          {
            entity: String,
            value: String,
            confidence: Number,
          },
        ],
      },
    ],
    context: {
      currentTopic: String,
      userLocation: {
        coordinates: [Number],
        address: String,
      },
      userFarms: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Farm",
        },
      ],
      lastWeatherQuery: Date,
      preferences: {
        language: {
          type: String,
          default: "en",
        },
        units: {
          temperature: {
            type: String,
            default: "celsius",
          },
        },
      },
    },
    feedback: [
      {
        messageIndex: Number,
        helpful: Boolean,
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    escalated: {
      isEscalated: {
        type: Boolean,
        default: false,
      },
      escalatedAt: Date,
      reason: String,
      expert: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      consultation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consultation",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    endedAt: Date,
  },
  {
    timestamps: true,
  },
)

// Indexes
chatBotSchema.index({ sessionId: 1 })
chatBotSchema.index({ user: 1, createdAt: -1 })
chatBotSchema.index({ isActive: 1 })

// Virtual for message count
chatBotSchema.virtual("messageCount").get(function () {
  return this.messages ? this.messages.length : 0
})

// Virtual for session duration
chatBotSchema.virtual("sessionDuration").get(function () {
  if (this.endedAt) {
    return this.endedAt.getTime() - this.createdAt.getTime()
  }
  return Date.now() - this.createdAt.getTime()
})

// Method to add message
chatBotSchema.methods.addMessage = function (sender, message, responseData = {}) {
  this.messages.push({
    sender: sender,
    message: message,
    timestamp: new Date(),
    ...responseData,
  })

  return this.save()
}

// Method to add feedback
chatBotSchema.methods.addFeedback = function (messageIndex, feedbackData) {
  this.feedback.push({
    messageIndex: messageIndex,
    ...feedbackData,
    timestamp: new Date(),
  })

  return this.save()
}

// Method to escalate to expert
chatBotSchema.methods.escalateToExpert = function (reason, expertId = null) {
  this.escalated = {
    isEscalated: true,
    escalatedAt: new Date(),
    reason: reason,
    expert: expertId,
  }

  return this.save()
}

// Method to end session
chatBotSchema.methods.endSession = function () {
  this.isActive = false
  this.endedAt = new Date()

  return this.save()
}

// Static method to create new session
chatBotSchema.statics.createSession = function (userId) {
  const sessionId = `chat_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

  return this.create({
    sessionId: sessionId,
    user: userId,
    messages: [],
    context: {},
    isActive: true,
  })
}

// Static method to get active session for user
chatBotSchema.statics.getActiveSession = function (userId) {
  return this.findOne({
    user: userId,
    isActive: true,
  }).sort({ createdAt: -1 })
}

// Static method to get session analytics
chatBotSchema.statics.getAnalytics = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: { $cond: ["$isActive", 1, 0] },
        },
        escalatedSessions: {
          $sum: { $cond: ["$escalated.isEscalated", 1, 0] },
        },
        avgMessageCount: { $avg: { $size: "$messages" } },
        avgSessionDuration: {
          $avg: {
            $cond: ["$endedAt", { $subtract: ["$endedAt", "$createdAt"] }, { $subtract: [new Date(), "$createdAt"] }],
          },
        },
      },
    },
  ])
}

module.exports = mongoose.model("ChatBot", chatBotSchema)
