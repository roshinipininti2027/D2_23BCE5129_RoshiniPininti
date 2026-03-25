"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, Plus, Droplets, Sprout, Bug, Scissors } from "lucide-react"
import axios from "axios"

interface CalendarEvent {
  _id: string
  title: string
  description: string
  date: string
  type: "planting" | "watering" | "fertilizing" | "harvesting" | "pest-control" | "general"
  cropName?: string
  farmName?: string
  status: "pending" | "completed" | "overdue"
}

interface CropCalendarProps {
  farmId?: string
  cropId?: string
  onEventClick?: (event: CalendarEvent) => void
}

export default function CropCalendar({ farmId, cropId, onEventClick }: CropCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showAddEvent, setShowAddEvent] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [currentDate, farmId, cropId])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append("month", (currentDate.getMonth() + 1).toString())
      params.append("year", currentDate.getFullYear().toString())
      if (farmId) params.append("farmId", farmId)
      if (cropId) params.append("cropId", cropId)

      const response = await axios.get(`/api/calendar/events?${params}`)
      setEvents(response.data.events || [])
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      // Mock data for demonstration
      setEvents([
        {
          _id: "1",
          title: "Water Rice Crop",
          description: "Regular watering schedule",
          date: new Date().toISOString(),
          type: "watering",
          cropName: "Rice",
          farmName: "Main Farm",
          status: "pending",
        },
        {
          _id: "2",
          title: "Apply Fertilizer",
          description: "NPK fertilizer application",
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          type: "fertilizing",
          cropName: "Wheat",
          farmName: "North Field",
          status: "pending",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "planting":
        return <Sprout className="w-3 h-3" />
      case "watering":
        return <Droplets className="w-3 h-3" />
      case "pest-control":
        return <Bug className="w-3 h-3" />
      case "harvesting":
        return <Scissors className="w-3 h-3" />
      default:
        return <Calendar className="w-3 h-3" />
    }
  }

  const getEventColor = (type: string, status: string) => {
    if (status === "overdue") return "bg-red-100 text-red-800 border-red-200"
    if (status === "completed") return "bg-green-100 text-green-800 border-green-200"

    switch (type) {
      case "planting":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "watering":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "fertilizing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "pest-control":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "harvesting":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayEvents = getEventsForDate(date)
      const isToday = date.toDateString() === new Date().toDateString()
      const isSelected = selectedDate?.toDateString() === date.toDateString()

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? "bg-green-50 border-green-300" : ""
          } ${isSelected ? "bg-blue-50 border-blue-300" : ""}`}
          onClick={() => setSelectedDate(date)}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? "text-green-600" : "text-gray-900"}`}>{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event._id}
                className={`text-xs px-1 py-0.5 rounded border truncate ${getEventColor(event.type, event.status)}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onEventClick?.(event)
                }}
              >
                <div className="flex items-center gap-1">
                  {getEventIcon(event.type)}
                  <span className="truncate">{event.title}</span>
                </div>
              </div>
            ))}
            {dayEvents.length > 2 && <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>}
          </div>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-900">Crop Calendar</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-medium text-gray-900 min-w-[200px] text-center">
                {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </h3>
              <button
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowAddEvent(true)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 border-b border-gray-200">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-0">{renderCalendarDays()}</div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="p-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Event Types</h4>
        <div className="flex flex-wrap gap-4">
          {[
            { type: "planting", label: "Planting", icon: <Sprout className="w-3 h-3" /> },
            { type: "watering", label: "Watering", icon: <Droplets className="w-3 h-3" /> },
            { type: "fertilizing", label: "Fertilizing", icon: <Calendar className="w-3 h-3" /> },
            { type: "pest-control", label: "Pest Control", icon: <Bug className="w-3 h-3" /> },
            { type: "harvesting", label: "Harvesting", icon: <Scissors className="w-3 h-3" /> },
          ].map(({ type, label, icon }) => (
            <div key={type} className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded text-xs border ${getEventColor(type, "pending")}`}>
                <div className="flex items-center gap-1">
                  {icon}
                  <span>{label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
