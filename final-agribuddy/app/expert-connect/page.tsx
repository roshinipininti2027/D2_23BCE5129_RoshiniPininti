"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import PrivateRoute from "../components/PrivateRoute"
import Navbar from "../components/Navbar"
import { MessageSquare, Send, User, Clock, Plus, Search } from "lucide-react"
import axios from "axios"
import { toast } from "react-toastify"
import Link from "next/link"

export default function ExpertConnect() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [queries, setQueries] = useState<any[]>([])
  const [selectedQuery, setSelectedQuery] = useState<any>(null)
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showNewQueryModal, setShowNewQueryModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    fetchQueries()
  }, [])

  const fetchQueries = async () => {
    try {
      try {
        const response = await axios.get("/api/consultations")
        setQueries(response.data.consultations || [])
      } catch (apiError) {
        console.log("Using mock consultation data")
        setQueries([
          {
            _id: "1",
            title: "Wheat crop yellowing issue",
            description:
              "My wheat crops are turning yellow and I'm not sure what's causing it. The leaves are starting from the bottom and moving up.",
            status: "open",
            priority: "high",
            category: "Disease",
            farmer: { name: "Rajesh Kumar", location: { address: "Punjab, India" } },
            expert: null,
            messages: [
              {
                sender: "farmer",
                message: "My wheat crops are turning yellow. What should I do?",
                timestamp: new Date().toISOString(),
                attachments: [],
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            _id: "2",
            title: "Rice pest control advice needed",
            description:
              "I'm seeing small insects on my rice plants. They seem to be eating the leaves. Need urgent advice on pest control.",
            status: "in_progress",
            priority: "medium",
            category: "Pest Control",
            farmer: { name: "Suresh Patel", location: { address: "Gujarat, India" } },
            expert: { name: "Dr. Sharma" },
            messages: [
              {
                sender: "farmer",
                message: "Small insects are eating my rice leaves. Please help!",
                timestamp: new Date().toISOString(),
                attachments: [],
              },
              {
                sender: "expert",
                message: "Can you send me photos of the insects and affected plants?",
                timestamp: new Date().toISOString(),
                attachments: [],
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching queries:", error)
      toast.error("Failed to load queries")
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedQuery || sendingMessage) return

    setSendingMessage(true)
    try {
      const response = await axios.post(`/api/consultations/${selectedQuery._id}/messages`, {
        content: newMessage.trim(),
      })

      if (response.data.success || response.data.message) {
        const updatedMessage = {
          sender: user?.role || "farmer",
          message: newMessage.trim(),
          timestamp: new Date().toISOString(),
          attachments: [],
        }

        setSelectedQuery({
          ...selectedQuery,
          messages: [...(selectedQuery.messages || []), updatedMessage],
        })

        setQueries(
          queries.map((q) =>
            q._id === selectedQuery._id ? { ...q, messages: [...(q.messages || []), updatedMessage] } : q,
          ),
        )

        setNewMessage("")
        toast.success("Message sent successfully!")
      }
    } catch (error: any) {
      console.error("Error sending message:", error)
      // Still allow local message if API fails (fallback)
      const updatedMessage = {
        sender: user?.role || "farmer",
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        attachments: [],
      }

      setSelectedQuery({
        ...selectedQuery,
        messages: [...(selectedQuery.messages || []), updatedMessage],
      })

      setQueries(
        queries.map((q) =>
          q._id === selectedQuery._id ? { ...q, messages: [...(q.messages || []), updatedMessage] } : q,
        ),
      )

      setNewMessage("")
      toast.success("Message sent (local)")
    } finally {
      setSendingMessage(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const filteredQueries = queries.filter((query) => {
    const matchesSearch =
      query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || query.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <PrivateRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
        </div>
      </PrivateRoute>
    )
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Expert Connect</h1>
                <p className="text-gray-600">Connect with agricultural experts for personalized advice</p>
              </div>
              <button
                onClick={() => setShowNewQueryModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Ask Expert
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Queries List */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* Search and Filter */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex gap-2 mb-3">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search queries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  {/* Queries */}
                  <div className="max-h-96 overflow-y-auto">
                    {filteredQueries.length > 0 ? (
                      filteredQueries.map((query) => (
                        <div
                          key={query._id}
                          onClick={() => setSelectedQuery(query)}
                          className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedQuery?._id === query._id ? "bg-green-50 border-l-4 border-l-green-600" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{query.title}</h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(query.status)}`}
                            >
                              {query.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">{query.description}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{query.farmer?.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={getPriorityColor(query.priority)}>{query.priority}</span>
                              <Clock className="w-3 h-3" />
                              <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">No queries found</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-2">
                {selectedQuery ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
                    {/* Query Header */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900 mb-1">{selectedQuery.title}</h2>
                          <p className="text-sm text-gray-600 mb-2">{selectedQuery.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Farmer: {selectedQuery.farmer?.name}</span>
                            <span>Category: {selectedQuery.category}</span>
                            {selectedQuery.expert && <span>Expert: {selectedQuery.expert.name}</span>}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedQuery.status)}`}
                        >
                          {selectedQuery.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {(selectedQuery.messages || []).map((message: any, index: number) => (
                        <div
                          key={index}
                          className={`flex ${message.sender === "farmer" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`flex items-start gap-3 max-w-xs lg:max-w-md ${
                              message.sender === "farmer" ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.sender === "farmer" ? "bg-blue-600 text-white" : "bg-green-100 text-green-600"
                              }`}
                            >
                              <User className="w-4 h-4" />
                            </div>
                            <div
                              className={`rounded-lg px-4 py-2 ${
                                message.sender === "farmer" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender === "farmer" ? "text-blue-100" : "text-gray-500"
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-gray-200 p-4">
                      <div className="flex gap-2">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          rows={2}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          disabled={sendingMessage}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex items-center justify-center">
                    <div className="text-center">
                      <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Query</h3>
                      <p className="text-gray-600">Choose a query from the list to view the conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New Query Modal */}
        {showNewQueryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ask an Expert</h2>
              <Link
                href="/advisor"
                onClick={() => setShowNewQueryModal(false)}
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Go to Expert Consultation
              </Link>
              <button
                onClick={() => setShowNewQueryModal(false)}
                className="w-full mt-3 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </PrivateRoute>
  )
}
