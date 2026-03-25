const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const compression = require("compression")
require("dotenv").config()

const app = express()

// Security middleware
app.use(helmet())
app.use(compression())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/agribuddy", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB")
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  })

// Import routes
const authRoutes = require("./routes/auth")
const farmRoutes = require("./routes/farms")
const weatherRoutes = require("./routes/weather")
const consultationRoutes = require("./routes/consultations")
const chatbotRoutes = require("./routes/chatbot")
const cropDiaryRoutes = require("./routes/cropDiary")
const advisoryRoutes = require("./routes/advisory")
const analyticsRoutes = require("./routes/analytics")
const notificationRoutes = require("./routes/notifications")

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/farms", farmRoutes)
app.use("/api/weather", weatherRoutes)
app.use("/api/consultations", consultationRoutes)
app.use("/api/chatbot", chatbotRoutes)
app.use("/api/crop-diary", cropDiaryRoutes)
app.use("/api/advisory", advisoryRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/notifications", notificationRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      errors: Object.values(err.errors).map((e) => e.message),
    })
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "Invalid ID format",
    })
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate field value",
    })
  }

  res.status(500).json({
    message: "Internal server error",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found",
  })
})

// Start weather service
const weatherService = require("./services/weatherService")
weatherService.startWeatherSync()

// Start notification service
const notificationService = require("./services/notificationService")
notificationService.startNotificationScheduler()

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
