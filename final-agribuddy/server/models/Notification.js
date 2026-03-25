const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "weather_alert",
        "activity_reminder",
        "crop_stage_update",
        "consultation_message",
        "advisory_published",
        "diary_reminder",
        "system_notification",
        "expert_response",
        "farm_update",
        "harvest_reminder",
        "irrigation_alert",
        "pest_alert",
        "disease_alert",
        "market_update",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["info", "warning", "urgent", "reminder", "social"],
      default: "info",
    },
    channels: [
      {
        type: String,
        enum: ["in_app"],
        default: "in_app",
      },
    ],
    status: {
      type: String,
      enum: ["unread", "read", "archived"],
      default: "unread",
    },
    readAt: Date,
    expiresAt: Date,
    actionRequired: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
    actionText: String,
    relatedEntity: {
      entityType: {
        type: String,
        enum: ["Farm", "CropDiary", "Consultation", "Advisory", "WeatherData", "User"],
      },
      entityId: mongoose.Schema.Types.ObjectId,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for efficient querying
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 })
notificationSchema.index({ type: 1, createdAt: -1 })
notificationSchema.index({ priority: 1, status: 1 })
notificationSchema.index({ expiresAt: 1 })
notificationSchema.index({ "relatedEntity.entityType": 1, "relatedEntity.entityId": 1 })

// Virtual for age of notification
notificationSchema.virtual("age").get(function () {
  return Date.now() - this.createdAt.getTime()
})

// Virtual for is expired
notificationSchema.virtual("isExpired").get(function () {
  return this.expiresAt && this.expiresAt < new Date()
})

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  if (this.status !== "read") {
    this.status = "read"
    this.readAt = new Date()
    return this.save()
  }
  return Promise.resolve(this)
}

// Static method to get unread notifications for user
notificationSchema.statics.getUnreadForUser = function (userId, limit = 50) {
  return this.find({
    recipient: userId,
    status: "unread",
    isActive: true,
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: new Date() } }],
  })
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
    .populate("sender", "name role")
}

// Static method to get notifications by type
notificationSchema.statics.getByType = function (userId, type, limit = 20) {
  return this.find({
    recipient: userId,
    type: type,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("sender", "name role")
}

// Static method to create weather alert notification
notificationSchema.statics.createWeatherAlert = function (userId, alertData) {
  return this.create({
    recipient: userId,
    type: "weather_alert",
    title: alertData.title,
    message: alertData.message,
    data: alertData,
    priority: alertData.severity === "critical" ? "critical" : alertData.severity === "high" ? "high" : "medium",
    category: alertData.severity === "critical" ? "urgent" : "warning",
    channels: ["in_app"],
    status: "unread",
    expiresAt: alertData.end_time,
  })
}

// Static method to create consultation notification
notificationSchema.statics.createConsultationNotification = function (recipientId, senderId, messageData) {
  return this.create({
    recipient: recipientId,
    sender: senderId,
    type: "consultation_message",
    title: "New message from expert",
    message: messageData.message,
    data: messageData,
    priority: "medium",
    category: "social",
    channels: ["in_app"],
    status: "unread",
    actionRequired: true,
    actionUrl: `/consultations/${messageData.consultationId}`,
    actionText: "View Message",
  })
}

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
    status: { $in: ["read", "archived"] },
  })
}

// Pre-save middleware
notificationSchema.pre("save", function (next) {
  // Set default expiry for certain types
  if (!this.expiresAt) {
    switch (this.type) {
      case "weather_alert":
        this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        break
      case "activity_reminder":
        this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        break
      case "diary_reminder":
        this.expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
        break
    }
  }

  next()
})

module.exports = mongoose.model("Notification", notificationSchema)
