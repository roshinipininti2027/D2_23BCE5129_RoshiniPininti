const Notification = require("../models/Notification")
const User = require("../models/User")
const WeatherData = require("../models/WeatherData")
const CropDiary = require("../models/CropDiary")
const cron = require("node-cron")

class NotificationService {
  constructor() {
    console.log("📢 Notification Service initialized (In-app notifications only)")
  }

  // Start notification scheduler
  startNotificationScheduler() {
    console.log("📢 Starting notification scheduler...")

    // Check for weather alerts every 30 minutes
    cron.schedule("*/30 * * * *", async () => {
      await this.checkWeatherAlerts()
    })

    // Send daily activity reminders at 7 AM
    cron.schedule("0 7 * * *", async () => {
      await this.sendActivityReminders()
    })

    // Send weekly crop stage updates on Sundays at 9 AM
    cron.schedule("0 9 * * 0", async () => {
      await this.sendCropStageUpdates()
    })

    // Clean up old notifications daily at midnight
    cron.schedule("0 0 * * *", async () => {
      await this.cleanupOldNotifications()
    })

    console.log("✅ Notification scheduler started")
  }

  // Check for weather alerts and notify farmers
  async checkWeatherAlerts() {
    try {
      console.log("🌤️  Checking weather alerts...")

      const farmers = await User.find({
        role: "farmer",
        isActive: true,
        "preferences.notifications.weather": true,
      }).populate("farms")

      for (const farmer of farmers) {
        if (!farmer.farms || farmer.farms.length === 0) continue

        for (const farm of farmer.farms) {
          if (!farm.location || !farm.location.coordinates) continue

          try {
            const weatherService = require("./weatherService")
            const alerts = await weatherService.getWeatherAlerts(
              farm.location.coordinates[1], // latitude
              farm.location.coordinates[0], // longitude
            )

            for (const alert of alerts) {
              // Check if we already sent this alert recently
              const existingAlert = await Notification.findOne({
                recipient: farmer._id,
                type: "weather_alert",
                "data.alertType": alert.type,
                createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }, // Last 6 hours
              })

              if (!existingAlert) {
                await this.createWeatherAlert(farmer._id, alert, farm)
              }
            }
          } catch (error) {
            console.error(`Error checking weather for farm ${farm._id}:`, error)
          }
        }
      }
    } catch (error) {
      console.error("Error checking weather alerts:", error)
    }
  }

  // Create weather alert notification
  async createWeatherAlert(farmerId, alert, farm) {
    try {
      const notification = await Notification.create({
        recipient: farmerId,
        type: "weather_alert",
        category: alert.severity === "critical" ? "urgent" : "warning",
        priority: alert.severity === "critical" ? "critical" : "high",
        title: alert.title,
        message: `${alert.message}\n\nFarm: ${farm.name}\nLocation: ${farm.location.address}`,
        data: {
          alertType: alert.type,
          severity: alert.severity,
          farmId: farm._id,
          farmName: farm.name,
          recommendations: alert.recommendations,
        },
        channels: ["in_app"],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        status: "unread",
      })

      console.log(`📢 Weather alert sent to farmer ${farmerId}: ${alert.title}`)
    } catch (error) {
      console.error("Error creating weather alert:", error)
    }
  }

  // Send daily activity reminders
  async sendActivityReminders() {
    try {
      console.log("📅 Sending daily activity reminders...")

      const activeDiaries = await CropDiary.find({
        status: "active",
        isActive: true,
      }).populate("farmer", "name preferences")

      for (const diary of activeDiaries) {
        if (!diary.farmer || !diary.farmer.preferences.notifications.activities) continue

        const today = new Date()
        const daysSincePlanting = Math.floor((today - diary.plantingDate) / (1000 * 60 * 60 * 24))

        // Generate activity suggestions based on crop stage and days since planting
        const suggestions = this.generateActivitySuggestions(diary, daysSincePlanting)

        if (suggestions.length > 0) {
          await Notification.create({
            recipient: diary.farmer._id,
            type: "activity_reminder",
            category: "reminder",
            priority: "medium",
            title: "Daily Farm Activities",
            message: `Here are today's recommended activities for your ${diary.crop.name}:\n\n${suggestions.join("\n")}`,
            data: {
              diaryId: diary._id,
              cropName: diary.crop.name,
              daysSincePlanting,
              suggestions,
            },
            channels: ["in_app"],
            status: "unread",
          })
        }
      }
    } catch (error) {
      console.error("Error sending activity reminders:", error)
    }
  }

  // Generate activity suggestions based on crop and growth stage
  generateActivitySuggestions(diary, daysSincePlanting) {
    const suggestions = []
    const cropName = diary.crop.name.toLowerCase()

    // General suggestions based on days since planting
    if (daysSincePlanting <= 7) {
      suggestions.push("• Monitor germination and seedling emergence")
      suggestions.push("• Ensure adequate soil moisture")
    } else if (daysSincePlanting <= 30) {
      suggestions.push("• Check for pest and disease symptoms")
      suggestions.push("• Apply first dose of fertilizer if needed")
      suggestions.push("• Remove weeds around plants")
    } else if (daysSincePlanting <= 60) {
      suggestions.push("• Monitor plant growth and health")
      suggestions.push("• Apply second dose of fertilizer")
      suggestions.push("• Check irrigation system efficiency")
    } else if (daysSincePlanting <= 90) {
      suggestions.push("• Watch for flowering/fruiting stage")
      suggestions.push("• Increase monitoring for pests")
      suggestions.push("• Prepare for harvest planning")
    }

    // Crop-specific suggestions
    if (cropName.includes("rice")) {
      if (daysSincePlanting <= 15) {
        suggestions.push("• Maintain 2-3 cm water level in field")
      } else if (daysSincePlanting <= 45) {
        suggestions.push("• Apply urea fertilizer")
      }
    } else if (cropName.includes("wheat")) {
      if (daysSincePlanting <= 21) {
        suggestions.push("• Ensure proper soil moisture for germination")
      } else if (daysSincePlanting <= 60) {
        suggestions.push("• Apply nitrogen fertilizer")
      }
    }

    return suggestions
  }

  // Send weekly crop stage updates
  async sendCropStageUpdates() {
    try {
      console.log("📊 Sending weekly crop stage updates...")

      const farmers = await User.find({
        role: "farmer",
        isActive: true,
        "preferences.notifications.schedules": true,
      })

      for (const farmer of farmers) {
        const activeDiaries = await CropDiary.find({
          farmer: farmer._id,
          status: "active",
          isActive: true,
        })

        if (activeDiaries.length === 0) continue

        let updateMessage = "Weekly Crop Update:\n\n"

        for (const diary of activeDiaries) {
          const currentStage = diary.currentStage
          const daysSincePlanting = diary.daysSincePlanting

          updateMessage += `🌱 ${diary.crop.name}:\n`
          updateMessage += `   Stage: ${currentStage?.name || "Unknown"}\n`
          updateMessage += `   Days: ${daysSincePlanting}\n`
          updateMessage += `   Activities: ${diary.activities.length}\n\n`
        }

        await Notification.create({
          recipient: farmer._id,
          type: "crop_stage_update",
          category: "info",
          priority: "low",
          title: "Weekly Crop Progress Report",
          message: updateMessage,
          data: {
            activeCrops: activeDiaries.length,
            totalActivities: activeDiaries.reduce((sum, d) => sum + d.activities.length, 0),
          },
          channels: ["in_app"],
          status: "unread",
        })
      }
    } catch (error) {
      console.error("Error sending crop stage updates:", error)
    }
  }

  // Clean up old notifications
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        status: { $in: ["read", "delivered"] },
      })

      console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`)
    } catch (error) {
      console.error("Error cleaning up notifications:", error)
    }
  }

  // Send custom notification
  async sendCustomNotification(recipientId, notificationData) {
    try {
      const notification = await Notification.create({
        recipient: recipientId,
        status: "unread",
        channels: ["in_app"],
        ...notificationData,
      })

      return notification
    } catch (error) {
      console.error("Error sending custom notification:", error)
      throw error
    }
  }

  // Send bulk notifications
  async sendBulkNotifications(recipientIds, notificationData) {
    try {
      const notifications = recipientIds.map((recipientId) => ({
        recipient: recipientId,
        status: "unread",
        channels: ["in_app"],
        ...notificationData,
      }))

      const createdNotifications = await Notification.insertMany(notifications)
      return createdNotifications
    } catch (error) {
      console.error("Error sending bulk notifications:", error)
      throw error
    }
  }

  // Send advisory notification to farmers
  async sendAdvisoryNotification(advisory, targetFarmers) {
    try {
      const notificationData = {
        type: "advisory_published",
        category: advisory.urgency === "Critical" ? "urgent" : "info",
        priority: advisory.urgency.toLowerCase(),
        title: `New ${advisory.category} Advisory`,
        message: `${advisory.title}\n\n${advisory.summary}`,
        data: {
          advisoryId: advisory._id,
          category: advisory.category,
          urgency: advisory.urgency,
        },
      }

      await this.sendBulkNotifications(targetFarmers, notificationData)
      console.log(`📢 Advisory notification sent to ${targetFarmers.length} farmers`)
    } catch (error) {
      console.error("Error sending advisory notification:", error)
    }
  }

  // Send consultation notification
  async sendConsultationNotification(recipientId, senderId, consultationData) {
    try {
      await this.sendCustomNotification(recipientId, {
        sender: senderId,
        type: "consultation_message",
        category: "social",
        priority: "medium",
        title: "New Message from Expert",
        message: consultationData.message,
        data: {
          consultationId: consultationData.consultationId,
          senderRole: consultationData.senderRole,
        },
      })
    } catch (error) {
      console.error("Error sending consultation notification:", error)
    }
  }

  // Send crop diary reminder
  async sendCropDiaryReminder(farmerId, diaryData) {
    try {
      await this.sendCustomNotification(farmerId, {
        type: "diary_reminder",
        category: "reminder",
        priority: "low",
        title: "Update Your Crop Diary",
        message: `Don't forget to log today's activities for your ${diaryData.cropName}. Regular logging helps track your crop's progress better.`,
        data: {
          diaryId: diaryData.diaryId,
          cropName: diaryData.cropName,
        },
      })
    } catch (error) {
      console.error("Error sending crop diary reminder:", error)
    }
  }
}

module.exports = new NotificationService()
