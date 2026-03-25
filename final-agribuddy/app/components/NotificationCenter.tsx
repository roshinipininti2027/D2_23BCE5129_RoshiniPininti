"use client"

import { useState, useEffect } from "react"
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Clock } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"

interface Notification {
  _id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  priority: "low" | "medium" | "high" | "critical"
  isRead: boolean
  createdAt: string
  actionUrl?: string
  actionText?: string
}

interface NotificationCenterProps {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/notifications")
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error("Error fetching notifications:", error)
      // Mock data for demonstration
      setNotifications([
        {
          _id: "1",
          title: "Weather Alert",
          message: "Heavy rain expected tomorrow. Consider protecting your crops.",
          type: "warning",
          priority: "high",
          isRead: false,
          createdAt: new Date().toISOString(),
          actionUrl: "/weather",
          actionText: "View Weather",
        },
        {
          _id: "2",
          title: "Expert Response",
          message: "Dr. Smith has responded to your query about pest control.",
          type: "info",
          priority: "medium",
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          actionUrl: "/advisor",
          actionText: "View Response",
        },
        {
          _id: "3",
          title: "Crop Diary Updated",
          message: "Your rice crop diary has been successfully updated.",
          type: "success",
          priority: "low",
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`).catch(() => {
        console.log("[v0] API call failed, updating local state")
      })
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? { ...notif, isRead: true } : notif)),
      )
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // Still update local state even if API fails
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === notificationId ? { ...notif, isRead: true } : notif)),
      )
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.patch("/api/notifications/mark-all-read").catch(() => {
        console.log("[v0] API call failed, updating all notifications locally")
      })
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
      toast.success("All notifications marked as read")
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      // Still update local state
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`)
      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId))
      toast.success("Notification deleted")
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Failed to delete notification")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-600" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-l-red-500"
      case "high":
        return "border-l-orange-500"
      case "medium":
        return "border-l-yellow-500"
      default:
        return "border-l-blue-500"
    }
  }

  const filteredNotifications = notifications.filter(
    (notif) => filter === "all" || (filter === "unread" && !notif.isRead),
  )

  const unreadCount = notifications.filter((notif) => !notif.isRead).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50 pt-16 pr-4">
      <div className="bg-white rounded-xl shadow-xl w-96 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{unreadCount}</span>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === "all" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === "unread" ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Unread ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto text-sm text-green-600 hover:text-green-700 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          ) : filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3
                          className={`text-sm font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3 text-gray-600" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Delete"
                          >
                            <X className="w-3 h-3 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.createdAt).toLocaleString()}
                        </div>
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                            onClick={onClose}
                          >
                            {notification.actionText || "View"}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500">
                {filter === "unread" ? "All caught up!" : "You have no notifications yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
