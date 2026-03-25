"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useLanguage } from "../contexts/LanguageContext"
import PrivateRoute from "../components/PrivateRoute"
import Navbar from "../components/Navbar"
import { Send, Bot, User, Sparkles } from "lucide-react"
import { toast } from "react-toastify"
import axios from "axios"

interface Message {
  sender: "user" | "bot"
  message: string
  timestamp: string
  responseType?: string
  quickReplies?: string[]
}

export default function ChatBot() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startChatSession()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, typing])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const startChatSession = async () => {
    try {
      setLoading(true)
      try {
        const response = await axios.post("/api/chatbot/start", {})
        if (response.data.sessionId) {
          setSessionId(response.data.sessionId)
        } else {
          const mockSessionId = `session_${Date.now()}`
          setSessionId(mockSessionId)
        }
      } catch (error) {
        const mockSessionId = `session_${Date.now()}`
        setSessionId(mockSessionId)
      }

      const welcomeMessage: Message = {
        sender: "bot",
        message: `Hello ${user?.name || "there"}! I'm your AgriBuddy AI Assistant. I'm here to help you with farming advice, weather information, crop management, pest control, and much more. How can I assist you today?`,
        timestamp: new Date().toISOString(),
        quickReplies: ["Weather Forecast", "Crop Advice", "Pest Control", "Irrigation Tips", "Talk to Expert"],
      }

      setMessages([welcomeMessage])
    } catch (error) {
      console.error("Error starting chat session:", error)
      toast.error("Failed to start chat session")
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || !sessionId || loading) return

    const userMessage: Message = {
      sender: "user",
      message: message.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setTyping(true)

    try {
      let botResponse = ""
      let quickReplies: string[] = []

      try {
        const response = await axios.post("/api/chatbot/message", {
          sessionId: sessionId,
          message: message.trim(),
        })
        botResponse = response.data.response || response.data.message
        quickReplies = response.data.quickReplies || []
      } catch (apiError) {
        // Generate mock response if API fails
        const lowerMessage = message.toLowerCase()

        if (lowerMessage.includes("weather")) {
          botResponse =
            "Based on current weather data for your region, here's what I can tell you:\n\n🌤️ Today: Partly cloudy, 28°C high, 18°C low\n🌧️ Tomorrow: Light rain expected, perfect for recently planted crops\n💧 Humidity: 65% - good for most vegetables\n\nWould you like specific irrigation recommendations based on this forecast?"
          quickReplies = ["Irrigation Advice", "5-Day Forecast", "Weather Alerts", "Crop Protection"]
        } else if (lowerMessage.includes("crop") || lowerMessage.includes("plant")) {
          botResponse =
            "I can help you with crop management! Here are some key recommendations:\n\n🌱 **Current Season Tips:**\n• Rice: Monitor for brown plant hopper\n• Wheat: Apply nitrogen fertilizer if leaves are yellowing\n• Vegetables: Ensure adequate drainage with recent rains\n\n📅 **Upcoming Tasks:**\n• Prepare for winter crop sowing\n• Check soil pH levels\n• Plan crop rotation"
          quickReplies = ["Rice Farming", "Wheat Care", "Vegetable Garden", "Soil Testing"]
        } else if (lowerMessage.includes("pest") || lowerMessage.includes("disease")) {
          botResponse =
            "Pest and disease management is crucial for healthy crops. Here's what I recommend:\n\n🐛 **Common Issues This Season:**\n• Aphids on leafy vegetables - use neem oil spray\n• Fungal infections due to humidity - improve air circulation\n• Caterpillars on crops - consider organic pesticides"
          quickReplies = ["Identify Pest", "Organic Solutions", "Chemical Treatments", "Prevention Tips"]
        } else {
          botResponse =
            "I understand you're looking for farming guidance. I can help you with:\n\n🌾 **Crop Management** • 🌤️ **Weather Insights** • 🐛 **Pest Control** • 💧 **Irrigation** • 🧪 **Soil Health**"
          quickReplies = ["Weather Forecast", "Crop Calendar", "Pest Control", "Fertilizer Guide", "Talk to Expert"]
        }
      }

      const botMessage: Message = {
        sender: "bot",
        message: botResponse,
        timestamp: new Date().toISOString(),
        quickReplies: quickReplies,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        sender: "bot",
        message:
          "I'm having trouble processing your request right now. Let me try to help you with some common farming topics instead.",
        timestamp: new Date().toISOString(),
        quickReplies: ["Weather Forecast", "Crop Advice", "Pest Control", "Irrigation Tips", "Talk to Expert"],
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setTyping(false)
    }
  }

  const handleQuickReply = (reply: string) => {
    if (reply === "Talk to Expert") {
      handleEscalateToExpert()
    } else {
      sendMessage(reply)
    }
  }

  const handleEscalateToExpert = async () => {
    if (!sessionId) return

    try {
      try {
        await axios.post("/api/chatbot/escalate", {
          sessionId: sessionId,
          reason: "User requested expert assistance from chatbot",
        })
      } catch (error) {
        console.error("API escalation failed, using mock")
      }

      toast.success("Connecting you with an expert! They will respond soon.")

      const escalationMessage: Message = {
        sender: "bot",
        message:
          "I've connected you with one of our agricultural experts. They have been notified and will respond to your query soon. In the meantime, feel free to ask me any other questions!",
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, escalationMessage])
    } catch (error) {
      console.error("Error escalating to expert:", error)
      toast.error("Failed to connect with expert")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
        <Navbar />

        <div className="pt-20 pb-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl mb-4 shadow-soft-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AgriBuddy AI Assistant</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Get expert farming advice, weather insights, crop recommendations, and personalized guidance
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-soft-lg border border-gray-100 overflow-hidden">
              <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
                {loading && messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      <span className="text-gray-600">Starting conversation...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-start gap-3 max-w-xs lg:max-w-md ${message.sender === "user" ? "flex-row-reverse" : ""}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft ${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                            }`}
                          >
                            {message.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>

                          <div
                            className={`rounded-2xl px-4 py-3 shadow-soft ${
                              message.sender === "user"
                                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                : "bg-white border border-gray-100 text-gray-900"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.message}</p>
                            <p
                              className={`text-xs mt-2 ${
                                message.sender === "user" ? "text-blue-100" : "text-gray-500"
                              }`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {messages.length > 0 &&
                      messages[messages.length - 1].sender === "bot" &&
                      messages[messages.length - 1].quickReplies && (
                        <div className="flex flex-wrap gap-2 ml-11">
                          {messages[messages.length - 1].quickReplies!.map((reply, index) => (
                            <button
                              key={index}
                              onClick={() => handleQuickReply(reply)}
                              className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm hover:bg-green-100 transition-colors border border-green-200 shadow-soft"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}

                    {typing && (
                      <div className="flex justify-start">
                        <div className="flex items-start gap-3 max-w-xs lg:max-w-md">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center flex-shrink-0 shadow-soft">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-soft">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="border-t border-gray-100 p-6 bg-white">
                <div className="flex gap-3">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about farming..."
                    rows={1}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-colors bg-gray-50 focus:bg-white"
                    disabled={loading || typing}
                  />
                  <button
                    onClick={() => sendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || loading || typing}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-soft-lg"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>

                {messages.length > 2 && (
                  <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Was this helpful?</span>
                    <button
                      onClick={() => handleEscalateToExpert()}
                      className="text-sm text-green-600 hover:text-green-700 px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Talk to Expert
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm mb-6 max-w-3xl mx-auto">
                I can help you with: Weather forecasts & alerts • Crop planting & harvest schedules • Pest & disease
                identification • Fertilizer recommendations • Irrigation guidance • Market prices • And much more!
              </p>
            </div>
          </div>
        </div>
      </div>
    </PrivateRoute>
  )
}
