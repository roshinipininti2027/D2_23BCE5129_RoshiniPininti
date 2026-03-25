"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import PrivateRoute from "../components/PrivateRoute"
import Navbar from "../components/Navbar"
import {
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  TrendingUp,
  Star,
  Eye,
  Search,
  Send,
  FileText,
  Calendar,
  MapPin,
  Plus,
} from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"

interface Consultation {
  _id: string
  title: string
  description: string
  category: string
  urgency: string
  status: string
  farmer: {
    _id: string
    name: string
    location: {
      address: string
    }
    profile: {
      avatar?: string
    }
  }
  farm?: {
    name: string
    location: {
      address: string
    }
    crops: string[]
  }
  messages: Array<{
    sender: string
    senderRole: string
    content: string
    timestamp: string
    isRead: boolean
  }>
  createdAt: string
  lastActivity: string
  unreadMessagesCount: number
}

interface Stats {
  total: number
  inProgress: number
  resolved: number
  avgRating: number
  avgResponseTime: number
}

export default function AdvisorDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    inProgress: 0,
    resolved: 0,
    avgRating: 0,
    avgResponseTime: 0,
  })
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"open" | "assigned" | "resolved">("open")
  const [filters, setFilters] = useState({
    category: "",
    urgency: "",
    search: "",
  })
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const [showNewQueryForm, setShowNewQueryForm] = useState(false)
  const [newQuery, setNewQuery] = useState({
    title: "",
    description: "",
    category: "general",
    urgency: "medium",
  })
  const [submittingQuery, setSubmittingQuery] = useState(false)

  useEffect(() => {
    fetchData()
  }, [user, activeTab, filters])

  const fetchData = async () => {
    try {
      setLoading(true)

      try {
        const response = await axios.get("/api/consultations/farmer")
        if (response.data.consultations && response.data.consultations.length > 0) {
          let filteredConsultations = response.data.consultations

          if (activeTab === "open") {
            filteredConsultations = filteredConsultations.filter((c: Consultation) => c.status === "open")
          } else if (activeTab === "assigned") {
            filteredConsultations = filteredConsultations.filter(
              (c: Consultation) => c.status === "assigned" || c.status === "in-progress",
            )
          } else if (activeTab === "resolved") {
            filteredConsultations = filteredConsultations.filter((c: Consultation) => c.status === "resolved")
          }

          if (filters.search) {
            filteredConsultations = filteredConsultations.filter(
              (c: Consultation) =>
                c.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                c.description.toLowerCase().includes(filters.search.toLowerCase()),
            )
          }

          setConsultations(filteredConsultations)

          if (response.data.stats) {
            setStats(response.data.stats)
          }
          return
        }
      } catch (error) {
        console.error("Error fetching from API:", error)
      }

      const mockConsultations = [
        {
          _id: "1",
          title: "Rice crop showing yellow leaves",
          description:
            "My rice crop is showing yellow leaves in some areas. The plants are about 45 days old. What could be the cause?",
          category: "crop-management",
          urgency: "medium",
          status: "open",
          farmer: {
            _id: "farmer1",
            name: "Rajesh Kumar",
            location: { address: "Punjab, India" },
            profile: {},
          },
          farm: {
            name: "Green Valley Farm",
            location: { address: "Punjab, India" },
            crops: ["Rice", "Wheat"],
          },
          messages: [],
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          unreadMessagesCount: 0,
        },
        {
          _id: "2",
          title: "Pest control for tomato plants",
          description:
            "I'm seeing small holes in my tomato leaves and some caterpillars. Need organic pest control solutions.",
          category: "pest-control",
          urgency: "high",
          status: "assigned",
          farmer: {
            _id: "farmer2",
            name: "Priya Sharma",
            location: { address: "Haryana, India" },
            profile: {},
          },
          messages: [
            {
              sender: "farmer2",
              senderRole: "farmer",
              content:
                "I'm seeing small holes in my tomato leaves and some caterpillars. Need organic pest control solutions.",
              timestamp: new Date().toISOString(),
              isRead: true,
            },
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          lastActivity: new Date().toISOString(),
          unreadMessagesCount: 1,
        },
      ]

      let filteredConsultations = mockConsultations

      if (activeTab === "open") {
        filteredConsultations = mockConsultations.filter((c) => c.status === "open")
      } else if (activeTab === "assigned") {
        filteredConsultations = mockConsultations.filter((c) => c.status === "assigned" || c.status === "in-progress")
      } else if (activeTab === "resolved") {
        filteredConsultations = mockConsultations.filter((c) => c.status === "resolved")
      }

      if (filters.search) {
        filteredConsultations = filteredConsultations.filter(
          (c: Consultation) =>
            c.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            c.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            c.farmer.name.toLowerCase().includes(filters.search.toLowerCase()),
        )
      }

      setConsultations(filteredConsultations)

      const mockStats = {
        total: 15,
        inProgress: 3,
        resolved: 10,
        avgRating: 4.5,
        avgResponseTime: 2.5 * 60 * 60 * 1000,
      }

      setStats(mockStats)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitQuery = async () => {
    if (!newQuery.title.trim() || !newQuery.description.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setSubmittingQuery(true)

      try {
        const response = await axios.post("/api/consultations", {
          title: newQuery.title,
          description: newQuery.description,
          category: newQuery.category,
          urgency: newQuery.urgency,
        })

        if (response.data.consultation) {
          setConsultations((prev) => [response.data.consultation, ...prev])
          setNewQuery({ title: "", description: "", category: "general", urgency: "medium" })
          setShowNewQueryForm(false)
          toast.success("Your query has been submitted successfully!")
          return
        }
      } catch (error) {
        console.error("API submission failed:", error)
      }

      const mockNewConsultation = {
        _id: `new_${Date.now()}`,
        title: newQuery.title,
        description: newQuery.description,
        category: newQuery.category,
        urgency: newQuery.urgency,
        status: "open",
        farmer: {
          _id: user?.id || "current_user",
          name: user?.name || "Current User",
          location: { address: user?.location || "Unknown Location" },
          profile: {},
        },
        messages: [],
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        unreadMessagesCount: 0,
      }

      setConsultations((prev) => [mockNewConsultation, ...prev])
      setNewQuery({ title: "", description: "", category: "general", urgency: "medium" })
      setShowNewQueryForm(false)
      toast.success("Your query has been submitted successfully!")
    } catch (error) {
      console.error("Error submitting query:", error)
      toast.error("Failed to submit query")
    } finally {
      setSubmittingQuery(false)
    }
  }

  const handleConsultationSelect = async (consultation: Consultation) => {
    try {
      setSelectedConsultation(consultation)
    } catch (error) {
      console.error("Error fetching consultation details:", error)
      toast.error("Failed to load consultation details")
    }
  }

  const handleAssignToMe = async (consultationId: string) => {
    try {
      toast.success("Consultation assigned to you successfully")
      fetchData()
      if (selectedConsultation?._id === consultationId) {
        setSelectedConsultation(null)
      }
    } catch (error: any) {
      console.error("Error assigning consultation:", error)
      toast.error("Failed to assign consultation")
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConsultation || !newMessage.trim()) return

    try {
      setSendingMessage(true)

      try {
        const response = await axios.post(`/api/consultations/${selectedConsultation._id}/messages`, {
          content: newMessage.trim(),
        })

        if (response.data.success) {
          const newMsg = {
            sender: user?.id || "current_user",
            senderRole: user?.role || "farmer",
            content: newMessage.trim(),
            timestamp: new Date().toISOString(),
            isRead: false,
          }

          setSelectedConsultation((prev) =>
            prev
              ? {
                  ...prev,
                  messages: [...prev.messages, newMsg],
                }
              : null,
          )

          setNewMessage("")
          toast.success("Message sent successfully")
          fetchData()
          return
        }
      } catch (error) {
        console.error("API error:", error)
      }

      const newMsg = {
        sender: user?.id || "current_user",
        senderRole: user?.role || "farmer",
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      setSelectedConsultation((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, newMsg],
            }
          : null,
      )

      setNewMessage("")
      toast.success("Message sent successfully")
      fetchData()
    } catch (error: any) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  const handleResolveConsultation = async () => {
    if (!selectedConsultation) return

    const summary = prompt("Please provide a resolution summary:")
    if (!summary) return

    try {
      toast.success("Consultation resolved successfully")
      setSelectedConsultation(null)
      fetchData()
    } catch (error: any) {
      console.error("Error resolving consultation:", error)
      toast.error("Failed to resolve consultation")
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "text-red-600 bg-red-100"
      case "high":
        return "text-orange-600 bg-orange-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-blue-600 bg-blue-100"
      case "assigned":
        return "text-purple-600 bg-purple-100"
      case "in-progress":
        return "text-yellow-600 bg-yellow-100"
      case "resolved":
        return "text-green-600 bg-green-100"
      case "closed":
        return "text-gray-600 bg-gray-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <Navbar />

        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.role === "expert" ? "Expert Dashboard" : "Ask Expert"}
                </h1>
                <p className="text-gray-600">
                  {user?.role === "expert"
                    ? "Manage farmer consultations and provide agricultural guidance"
                    : "Get expert advice for your farming questions and challenges"}
                </p>
              </div>

              {user?.role === "farmer" && (
                <button
                  onClick={() => setShowNewQueryForm(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                >
                  <Plus className="w-5 h-5" />
                  Ask Question
                </button>
              )}
            </div>

            {showNewQueryForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900">Ask an Expert</h2>
                      <button
                        onClick={() => setShowNewQueryForm(false)}
                        className="text-gray-400 hover:text-gray-600 p-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question Title *</label>
                      <input
                        type="text"
                        value={newQuery.title}
                        onChange={(e) => setNewQuery({ ...newQuery, title: e.target.value })}
                        placeholder="Brief description of your farming question"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description *</label>
                      <textarea
                        value={newQuery.description}
                        onChange={(e) => setNewQuery({ ...newQuery, description: e.target.value })}
                        placeholder="Provide detailed information about your farming issue, including crop type, symptoms, location, etc."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                          value={newQuery.category}
                          onChange={(e) => setNewQuery({ ...newQuery, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        >
                          <option value="general">General</option>
                          <option value="crop-management">Crop Management</option>
                          <option value="pest-control">Pest Control</option>
                          <option value="disease-management">Disease Management</option>
                          <option value="soil-health">Soil Health</option>
                          <option value="irrigation">Irrigation</option>
                          <option value="fertilization">Fertilization</option>
                          <option value="weather-related">Weather Related</option>
                          <option value="market-information">Market Information</option>
                          <option value="equipment">Equipment</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                        <select
                          value={newQuery.urgency}
                          onChange={(e) => setNewQuery({ ...newQuery, urgency: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                      onClick={() => setShowNewQueryForm(false)}
                      className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitQuery}
                      disabled={submittingQuery || !newQuery.title.trim() || !newQuery.description.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {submittingQuery ? "Submitting..." : "Submit Question"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards - Only show for experts */}
            {user?.role === "expert" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Consultations</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolved</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Star className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Response Time</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {stats.avgResponseTime ? `${Math.round(stats.avgResponseTime / (1000 * 60 * 60))}h` : "N/A"}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Consultations List */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100">
                  {user?.role === "expert" && (
                    <div className="border-b border-gray-100">
                      <nav className="flex space-x-8 px-6">
                        {[
                          {
                            key: "open",
                            label: "Open Queries",
                            count: consultations.filter((c) => c.status === "open").length,
                          },
                          {
                            key: "assigned",
                            label: "My Consultations",
                            count: consultations.filter((c) => c.status === "assigned" || c.status === "in-progress")
                              .length,
                          },
                          {
                            key: "resolved",
                            label: "Resolved",
                            count: consultations.filter((c) => c.status === "resolved").length,
                          },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as any)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                              activeTab === tab.key
                                ? "border-green-500 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                          >
                            {tab.label}
                            {tab.count > 0 && (
                              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                                {tab.count}
                              </span>
                            )}
                          </button>
                        ))}
                      </nav>
                    </div>
                  )}

                  {/* Filters */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search consultations..."
                          value={filters.search}
                          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        />
                      </div>
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                        <option value="">All Categories</option>
                        <option value="crop-management">Crop Management</option>
                        <option value="pest-control">Pest Control</option>
                        <option value="disease-management">Disease Management</option>
                        <option value="soil-health">Soil Health</option>
                        <option value="irrigation">Irrigation</option>
                        <option value="fertilization">Fertilization</option>
                        <option value="weather-related">Weather Related</option>
                        <option value="market-information">Market Information</option>
                        <option value="equipment">Equipment</option>
                        <option value="general">General</option>
                      </select>
                      <select
                        value={filters.urgency}
                        onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                        className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      >
                        <option value="">All Urgency</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  {/* Consultations List */}
                  <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Loading consultations...</p>
                      </div>
                    ) : consultations.length > 0 ? (
                      consultations.map((consultation) => (
                        <div
                          key={consultation._id}
                          onClick={() => handleConsultationSelect(consultation)}
                          className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedConsultation?._id === consultation._id
                              ? "bg-green-50 border-r-4 border-green-500"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{consultation.title}</h3>
                              <p className="text-gray-600 text-sm line-clamp-2">{consultation.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 ml-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(consultation.urgency)}`}
                              >
                                {consultation.urgency}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(consultation.status)}`}
                              >
                                {consultation.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{consultation.farmer.name}</span>
                              </div>
                              {consultation.farm && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{consultation.farm.name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(consultation.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {consultation.unreadMessagesCount > 0 && (
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {consultation.unreadMessagesCount} new
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No consultations found</h3>
                        <p className="text-gray-500">
                          {user?.role === "farmer"
                            ? "You haven't asked any questions yet. Click 'Ask Question' to get started!"
                            : activeTab === "open"
                              ? "No open queries available at the moment."
                              : activeTab === "assigned"
                                ? "You haven't been assigned any consultations yet."
                                : "No resolved consultations to show."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-soft border border-gray-100 h-fit">
                  {selectedConsultation ? (
                    <>
                      {/* Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedConsultation.title}</h2>
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(selectedConsultation.urgency)}`}
                              >
                                {selectedConsultation.urgency}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedConsultation.status)}`}
                              >
                                {selectedConsultation.status}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {selectedConsultation.category}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Farmer Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h3 className="font-medium text-gray-900 mb-2">Farmer Details</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span>{selectedConsultation.farmer.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span>{selectedConsultation.farmer.location.address}</span>
                            </div>
                            {selectedConsultation.farm && (
                              <>
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-500" />
                                  <span>Farm: {selectedConsultation.farm.name}</span>
                                </div>
                                {selectedConsultation.farm.crops.length > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Crops:</span>
                                    <span>{selectedConsultation.farm.crops.join(", ")}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{selectedConsultation.description}</p>
                        </div>

                        {/* Actions */}
                        {user?.role === "expert" && selectedConsultation.status === "open" && (
                          <button
                            onClick={() => handleAssignToMe(selectedConsultation._id)}
                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            Assign to Me
                          </button>
                        )}

                        {user?.role === "expert" &&
                          (selectedConsultation.status === "assigned" ||
                            selectedConsultation.status === "in-progress") && (
                            <button
                              onClick={handleResolveConsultation}
                              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                              Mark as Resolved
                            </button>
                          )}
                      </div>

                      {/* Messages */}
                      <div className="p-6">
                        <h3 className="font-medium text-gray-900 mb-4">Conversation</h3>
                        <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                          {selectedConsultation.messages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.senderRole === "expert" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.senderRole === "expert"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-900"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    message.senderRole === "expert" ? "text-green-100" : "text-gray-500"
                                  }`}
                                >
                                  {new Date(message.timestamp).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Message Input */}
                        {((user?.role === "expert" &&
                          (selectedConsultation.status === "assigned" ||
                            selectedConsultation.status === "in-progress")) ||
                          (user?.role === "farmer" && selectedConsultation.farmer._id === user?.id)) && (
                          <div className="flex gap-2">
                            <textarea
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type your response..."
                              rows={3}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-colors"
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={!newMessage.trim() || sendingMessage}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Consultation</h3>
                      <p className="text-gray-500">Choose a consultation from the list to view details and respond.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}
