const mongoose = require("mongoose")

const consultationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "assigned", "in-progress", "resolved", "closed"],
      default: "open",
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
    },
    crop: {
      name: String,
      variety: String,
      stage: String,
    },
    images: [
      {
        url: String,
        description: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        senderRole: {
          type: String,
          enum: ["farmer", "expert"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        attachments: [
          {
            type: String,
            url: String,
            filename: String,
          },
        ],
      },
    ],
    resolution: {
      summary: String,
      recommendations: [String],
      followUpRequired: {
        type: Boolean,
        default: false,
      },
      followUpDate: Date,
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      resolvedAt: Date,
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: Date,
    },
    tags: [String],
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    assignedAt: Date,
    responseTime: Number, // in milliseconds
    resolutionTime: Number, // in milliseconds
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
consultationSchema.index({ farmer: 1, status: 1 })
consultationSchema.index({ expert: 1, status: 1 })
consultationSchema.index({ category: 1, urgency: 1 })
consultationSchema.index({ status: 1, createdAt: -1 })
consultationSchema.index({ tags: 1 })

// Virtual for last activity
consultationSchema.virtual("lastActivity").get(function () {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1].timestamp
  }
  return this.updatedAt
})

// Virtual for unread messages count for farmer
consultationSchema.virtual("unreadMessagesForFarmer").get(function () {
  if (!this.messages) return 0
  return this.messages.filter((msg) => msg.senderRole === "expert" && !msg.isRead).length
})

// Virtual for unread messages count for expert
consultationSchema.virtual("unreadMessagesForExpert").get(function () {
  if (!this.messages) return 0
  return this.messages.filter((msg) => msg.senderRole === "farmer" && !msg.isRead).length
})

// Method to assign to expert
consultationSchema.methods.assignToExpert = function (expertId) {
  this.expert = expertId
  this.status = "assigned"
  this.assignedAt = new Date()
  return this.save()
}

// Method to add message
consultationSchema.methods.addMessage = function (senderId, senderRole, content, attachments = []) {
  this.messages.push({
    sender: senderId,
    senderRole: senderRole,
    content: content,
    attachments: attachments,
    timestamp: new Date(),
    isRead: false,
  })

  // Update status to in-progress if it was assigned
  if (this.status === "assigned") {
    this.status = "in-progress"
  }

  return this.save()
}

// Method to mark messages as read
consultationSchema.methods.markMessagesAsRead = function (userRole) {
  let hasUnread = false

  this.messages.forEach((message) => {
    if (message.senderRole !== userRole && !message.isRead) {
      message.isRead = true
      hasUnread = true
    }
  })

  if (hasUnread) {
    return this.save()
  }

  return Promise.resolve(this)
}

// Method to resolve consultation
consultationSchema.methods.resolve = function (expertId, summary, recommendations = []) {
  this.status = "resolved"
  this.resolution = {
    summary: summary,
    recommendations: recommendations,
    resolvedBy: expertId,
    resolvedAt: new Date(),
  }

  // Calculate resolution time
  if (this.assignedAt) {
    this.resolutionTime = Date.now() - this.assignedAt.getTime()
  }

  return this.save()
}

// Method to add feedback
consultationSchema.methods.addFeedback = function (rating, comment) {
  this.feedback = {
    rating: rating,
    comment: comment,
    submittedAt: new Date(),
  }

  return this.save()
}

// Static method to get open consultations
consultationSchema.statics.getOpenConsultations = function (filters = {}) {
  const query = { status: "open", isActive: true, ...filters }

  return this.find(query)
    .populate("farmer", "name location profile")
    .populate("farm", "name location crops")
    .sort({ urgency: -1, createdAt: -1 })
}

// Static method to get expert's consultations
consultationSchema.statics.getExpertConsultations = function (expertId, status = null) {
  const query = { expert: expertId, isActive: true }
  if (status) query.status = status

  return this.find(query)
    .populate("farmer", "name location profile")
    .populate("farm", "name location crops")
    .sort({ updatedAt: -1 })
}

// Static method to get farmer's consultations
consultationSchema.statics.getFarmerConsultations = function (farmerId, status = null) {
  const query = { farmer: farmerId, isActive: true }
  if (status) query.status = status

  return this.find(query)
    .populate("expert", "name profile expertise")
    .populate("farm", "name location")
    .sort({ updatedAt: -1 })
}

// Pre-save middleware to calculate response time
consultationSchema.pre("save", function (next) {
  if (this.isModified("messages") && this.messages.length > 0) {
    const lastMessage = this.messages[this.messages.length - 1]

    // If this is the first expert response, calculate response time
    if (lastMessage.senderRole === "expert" && !this.responseTime) {
      this.responseTime = Date.now() - this.createdAt.getTime()
    }
  }

  next()
})

module.exports = mongoose.model("Consultation", consultationSchema)
