const express = require("express")
const jwt = require("jsonwebtoken")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

// Register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("location").notEmpty().withMessage("Location is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { 
        name, 
        email, 
        password, 
        phone, 
        location, 
        coordinates,
        role,
        expertise,
        experience,
        certification,
        farmingExperience 
      } = req.body

      // Check if user exists
      let user = await User.findOne({ email })
      if (user) {
        return res.status(400).json({ message: "User already exists" })
      }

      // Parse location string to get coordinates
      let parsedCoordinates = [0, 0]
      if (location) {
        // Try to extract coordinates from location string
        const coordMatch = location.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
        if (coordMatch) {
          parsedCoordinates = [parseFloat(coordMatch[2]), parseFloat(coordMatch[1])] // [lng, lat]
        }
      }

      // If coordinates are provided separately, use them
      if (coordinates) {
        if (Array.isArray(coordinates)) {
          parsedCoordinates = coordinates
        } else if (typeof coordinates === 'string') {
          try {
            parsedCoordinates = JSON.parse(coordinates)
          } catch (e) {
            // Keep default coordinates
          }
        }
      }

      // Prepare location object
      const locationObj = {
        address: location,
        coordinates: parsedCoordinates,
        district: req.body.district || "",
        state: req.body.state || "",
        country: "India"
      }

      // Handle expertise - only for experts and only valid enum values
      let validExpertise = []
      if (role === "expert" && expertise) {
        const validExpertiseValues = [
          "crop-management",
          "soil-health", 
          "pest-control",
          "irrigation",
          "organic-farming",
          "livestock",
          "horticulture",
          "agribusiness"
        ]
        
        if (Array.isArray(expertise)) {
          validExpertise = expertise.filter(exp => validExpertiseValues.includes(exp))
        } else if (typeof expertise === 'string') {
          if (validExpertiseValues.includes(expertise)) {
            validExpertise = [expertise]
          }
        }
      }

      // Create user
      user = new User({
        name,
        email,
        password,
        phone,
        location: locationObj,
        role: role || "farmer",
        expertise: validExpertise,
        experience: experience || "beginner",
        certification: certification || "",
        farmingExperience: farmingExperience || 0
      })

      await user.save()

      // Create JWT token
      const payload = {
        userId: user.id,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          role: user.role,
          expertise: user.expertise,
          experience: user.experience,
          farmingExperience: user.farmingExperience,
        },
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // Check if user exists
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Check password
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" })
      }

      // Update last login without triggering validation
      await User.updateOne(
        { _id: user._id },
        { $set: { lastLogin: new Date() } }
      )

      // Create JWT token
      const payload = {
        userId: user.id,
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" })

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
          role: user.role,
          expertise: user.expertise,
          experience: user.experience,
          farmingExperience: user.farmingExperience,
        },
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate("farms")
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const {
      name,
      phone,
      location,
      coordinates,
      expertise,
      experience,
      certification,
      preferences
    } = req.body

    const updateData = {}
    
    if (name) updateData.name = name
    if (phone) updateData.phone = phone
    if (location) {
      updateData['location.address'] = location
      if (coordinates) updateData['location.coordinates'] = coordinates
    }
    if (expertise) updateData.expertise = expertise
    if (experience) updateData.experience = experience
    if (certification) updateData.certification = certification
    if (preferences) {
      Object.keys(preferences).forEach(key => {
        updateData[`preferences.${key}`] = preferences[key]
      })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        role: user.role,
        expertise: user.expertise,
        experience: user.experience,
        preferences: user.preferences
      }
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    // Update password using updateOne to avoid validation issues
    const bcrypt = require("bcryptjs")
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(newPassword, salt)
    
    await User.updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword } }
    )

    res.json({ message: "Password changed successfully" })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get user statistics
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id
    
    // Import models here to avoid circular dependency
    const Farm = require("../models/Farm")
    const CropSchedule = require("../models/CropSchedule")
    const ActivityLog = require("../models/ActivityLog")

    const [farms, schedules, activities] = await Promise.all([
      Farm.find({ owner: userId, isActive: true }),
      CropSchedule.find({ farmer: userId }),
      ActivityLog.find({ farmer: userId }).sort({ createdAt: -1 }).limit(5)
    ])

    const stats = {
      totalFarms: farms.length,
      totalArea: farms.reduce((sum, farm) => sum + (farm.area?.value || 0), 0),
      activeCrops: farms.reduce((sum, farm) => sum + (farm.activeCropsCount || 0), 0),
      totalSchedules: schedules.length,
      completedSchedules: schedules.filter(s => s.status === "Completed").length,
      totalActivities: activities.length,
      recentActivities: activities.map(activity => ({
        id: activity._id,
        type: activity.activityType,
        description: activity.description,
        date: activity.date,
        farm: activity.farm
      }))
    }

    res.json(stats)
  } catch (error) {
    console.error("Get stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
