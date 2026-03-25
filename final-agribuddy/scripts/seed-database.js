const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
require("dotenv").config()

const User = require("../server/models/User")
const Farm = require("../server/models/Farm")
const CropDiary = require("../server/models/CropDiary")
const Notification = require("../server/models/Notification")

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB!")

    // Clear existing data
    console.log("Clearing existing data...")
    await User.deleteMany({})
    await Farm.deleteMany({})
    await CropDiary.deleteMany({})
    await Notification.deleteMany({})

    // Create sample farmers
    console.log("Creating sample farmers...")
    const farmer1 = new User({
      name: "Rajesh Kumar",
      email: "rajesh@agribuddy.com",
      password: "password123",
      role: "farmer",
      phone: "9876543210",
      location: {
        address: "Village Mandi, Punjab",
        coordinates: [73.1808, 31.7683],
        state: "Punjab",
        district: "Amritsar",
        pincode: "143001",
      },
      profile: {
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
        bio: "Organic farmer with 15 years of experience",
        languages: ["hi", "en"],
        farmingType: "organic",
      },
      preferences: {
        language: "hi",
      },
    })

    const farmer2 = new User({
      name: "Priya Singh",
      email: "priya@agribuddy.com",
      password: "password123",
      role: "farmer",
      phone: "9876543211",
      location: {
        address: "Village Haryana, Haryana",
        coordinates: [77.2245, 28.6139],
        state: "Haryana",
        district: "Faridabad",
        pincode: "121001",
      },
      profile: {
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
        bio: "Vegetable farming specialist",
        languages: ["hi", "en"],
        farmingType: "conventional",
      },
      preferences: {
        language: "hi",
      },
    })

    const farmer3 = new User({
      name: "Amit Patel",
      email: "amit@agribuddy.com",
      password: "password123",
      role: "farmer",
      phone: "9876543212",
      location: {
        address: "Ahmedabad, Gujarat",
        coordinates: [72.5797, 23.0225],
        state: "Gujarat",
        district: "Ahmedabad",
        pincode: "380001",
      },
      profile: {
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
        bio: "Cotton and groundnut farmer",
        languages: ["gu", "hi", "en"],
        farmingType: "mixed",
      },
      preferences: {
        language: "en",
      },
    })

    // Create sample experts
    console.log("Creating sample agricultural experts...")
    const expert1 = new User({
      name: "Dr. Anil Sharma",
      email: "expert@agribuddy.com",
      password: "password123",
      role: "expert",
      phone: "9876543220",
      location: {
        address: "Agricultural Department, Delhi",
        coordinates: [77.2098, 28.6139],
        state: "Delhi",
        district: "New Delhi",
        pincode: "110001",
      },
      profile: {
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anil",
        bio: "Senior Agricultural Scientist",
        experience: 20,
        specialization: ["Rice", "Wheat", "Sustainable Farming"],
        languages: ["hi", "en"],
      },
      expertise: {
        qualifications: ["M.Sc Agriculture", "PhD Soil Science"],
        certifications: ["ISO Certified", "Organic Farming Expert"],
        rating: {
          average: 4.8,
          count: 245,
        },
        consultationsHandled: 1200,
      },
    })

    const expert2 = new User({
      name: "Ms. Neha Verma",
      email: "expert2@agribuddy.com",
      password: "password123",
      role: "expert",
      phone: "9876543221",
      location: {
        address: "Research Institute, Bangalore",
        coordinates: [77.5946, 12.9716],
        state: "Karnataka",
        district: "Bangalore",
        pincode: "560001",
      },
      profile: {
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
        bio: "Vegetable Farming Expert",
        experience: 12,
        specialization: ["Tomato", "Onion", "Cabbage"],
        languages: ["en", "hi"],
      },
      expertise: {
        qualifications: ["B.Tech Agriculture", "M.Sc Horticulture"],
        certifications: ["Pest Management", "Soil Testing"],
        rating: {
          average: 4.6,
          count: 189,
        },
        consultationsHandled: 856,
      },
    })

    await farmer1.save()
    await farmer2.save()
    await farmer3.save()
    await expert1.save()
    await expert2.save()

    // Create farms
    console.log("Creating sample farms...")
    const farm1 = new Farm({
      name: "Green Valley Organic Farm",
      owner: farmer1._id,
      location: {
        address: "Village Mandi, Amritsar",
        coordinates: [73.1808, 31.7683],
        district: "Amritsar",
        state: "Punjab",
        country: "India",
      },
      area: {
        value: 25,
        unit: "acres",
      },
      soilType: "Loamy",
      irrigationType: "Drip",
      description: "Premium organic rice and wheat farm",
      crops: ["Rice", "Wheat"],
      machinery: ["Tractor", "Harvester", "Irrigation Pump"],
      facilities: ["Storage Warehouse", "Cold Storage"],
      totalInvestment: 500000,
      totalRevenue: 850000,
      activeCropsCount: 2,
      soilHealth: {
        pH: 7.2,
        nitrogen: 250,
        phosphorus: 35,
        potassium: 180,
        organicMatter: 3.5,
        lastTested: new Date("2024-10-01"),
      },
    })

    const farm2 = new Farm({
      name: "Sunrise Vegetable Farm",
      owner: farmer2._id,
      location: {
        address: "Village Haryana, Faridabad",
        coordinates: [77.2245, 28.6139],
        district: "Faridabad",
        state: "Haryana",
        country: "India",
      },
      area: {
        value: 15,
        unit: "acres",
      },
      soilType: "Clay",
      irrigationType: "Sprinkler",
      description: "Modern vegetable farming with precision agriculture",
      crops: ["Tomato", "Onion", "Cabbage"],
      machinery: ["Tractor", "Sprayer", "Seeder"],
      facilities: ["Greenhouse", "Processing Unit"],
      totalInvestment: 350000,
      totalRevenue: 620000,
      activeCropsCount: 3,
      soilHealth: {
        pH: 6.8,
        nitrogen: 280,
        phosphorus: 42,
        potassium: 200,
        organicMatter: 4.2,
        lastTested: new Date("2024-10-15"),
      },
    })

    const farm3 = new Farm({
      name: "Cotton & Groundnut Estate",
      owner: farmer3._id,
      location: {
        address: "Ahmedabad, Gujarat",
        coordinates: [72.5797, 23.0225],
        district: "Ahmedabad",
        state: "Gujarat",
        country: "India",
      },
      area: {
        value: 40,
        unit: "acres",
      },
      soilType: "Sandy",
      irrigationType: "Flood",
      description: "Large-scale cotton and groundnut production",
      crops: ["Cotton", "Groundnut", "Sesame"],
      machinery: ["Tractor", "Harvester", "Thresher"],
      facilities: ["Storage Warehouse", "Equipment Shed"],
      totalInvestment: 800000,
      totalRevenue: 1500000,
      activeCropsCount: 3,
      soilHealth: {
        pH: 7.0,
        nitrogen: 200,
        phosphorus: 30,
        potassium: 150,
        organicMatter: 2.8,
        lastTested: new Date("2024-09-20"),
      },
    })

    await farm1.save()
    await farm2.save()
    await farm3.save()

    farmer1.farms = [farm1._id]
    farmer2.farms = [farm2._id]
    farmer3.farms = [farm3._id]

    await farmer1.save()
    await farmer2.save()
    await farmer3.save()

    // Create crop diaries with comprehensive data
    console.log("Creating sample crop diaries...")
    const cropDiary1 = new CropDiary({
      farmer: farmer1._id,
      farm: farm1._id,
      crop: {
        name: "Basmati Rice",
        variety: "Type 1121",
        season: "kharif",
        category: "cereals",
      },
      area: {
        value: 10,
        unit: "acres",
      },
      plantingDate: new Date("2024-06-15"),
      expectedHarvestDate: new Date("2024-10-15"),
      actualHarvestDate: new Date("2024-10-12"),
      status: "completed",
      currentStage: {
        name: "harvesting",
        startDate: new Date("2024-10-01"),
        status: "completed",
      },
      activities: [
        {
          date: new Date("2024-06-15"),
          type: "land-preparation",
          description: "Field preparation and leveling completed",
          cost: { amount: 15000, currency: "INR" },
          labor: { hours: 40, workers: 5, cost: 3000 },
          weather: { temperature: 32, humidity: 65, rainfall: 0, conditions: "Sunny" },
          notes: "Field ready for sowing",
        },
        {
          date: new Date("2024-06-20"),
          type: "sowing",
          description: "Sowed 50kg of Basmati rice seeds",
          cost: { amount: 8000, currency: "INR" },
          materials: [{ name: "Seeds", quantity: 50, unit: "kg", cost: 8000 }],
          weather: { temperature: 31, humidity: 70, rainfall: 2, conditions: "Cloudy" },
          notes: "Good germination expected",
        },
        {
          date: new Date("2024-07-10"),
          type: "irrigation",
          description: "First irrigation completed",
          cost: { amount: 5000, currency: "INR" },
          weather: { temperature: 33, humidity: 68, rainfall: 5, conditions: "Sunny" },
          notes: "Water level maintained",
        },
        {
          date: new Date("2024-07-25"),
          type: "fertilization",
          description: "Applied NPK fertilizer 100kg",
          cost: { amount: 12000, currency: "INR" },
          materials: [{ name: "NPK 10-26-26", quantity: 100, unit: "kg", cost: 12000 }],
          labor: { hours: 8, workers: 2, cost: 800 },
          weather: { temperature: 32, humidity: 75, rainfall: 1, conditions: "Partly Cloudy" },
          notes: "Crop looking healthy",
        },
        {
          date: new Date("2024-08-20"),
          type: "pest-control",
          description: "Sprayed pesticide for stem borer control",
          cost: { amount: 6000, currency: "INR" },
          materials: [{ name: "Chlorpyrifos 20%", quantity: 5, unit: "L", cost: 6000 }],
          labor: { hours: 6, workers: 2, cost: 600 },
          weather: { temperature: 31, humidity: 72, rainfall: 0, conditions: "Sunny" },
          notes: "Pest infestation controlled",
        },
        {
          date: new Date("2024-09-15"),
          type: "observation",
          description: "Crop at flowering stage, looking excellent",
          weather: { temperature: 30, humidity: 60, rainfall: 0, conditions: "Clear" },
          notes: "Expected good yield",
        },
        {
          date: new Date("2024-10-12"),
          type: "harvesting",
          description: "Harvesting completed, yield: 45 quintals",
          cost: { amount: 20000, currency: "INR" },
          labor: { hours: 60, workers: 10, cost: 20000 },
          weather: { temperature: 28, humidity: 50, rainfall: 0, conditions: "Clear" },
          notes: "Good quality grain obtained",
        },
      ],
      economics: {
        totalInvestment: 69600,
        breakdown: {
          seeds: 8000,
          fertilizers: 12000,
          pesticides: 6000,
          labor: 24600,
          irrigation: 5000,
          equipment: 14000,
          other: 0,
        },
        revenue: {
          totalRevenue: 180000,
          pricePerUnit: 4000,
          soldQuantity: 45,
          unit: "quintals",
        },
        profit: 110400,
        roi: 158.6,
      },
      yield: {
        expected: { quantity: 40, unit: "quintals" },
        actual: {
          quantity: 45,
          unit: "quintals",
          quality: "excellent",
        },
      },
      challenges: [],
      notes: "Very successful harvest. Market price was excellent this season.",
      tags: ["high-yield", "organic", "premium"],
    })

    const cropDiary2 = new CropDiary({
      farmer: farmer2._id,
      farm: farm2._id,
      crop: {
        name: "Tomato",
        variety: "Hybrid-10",
        season: "zaid",
        category: "vegetables",
      },
      area: {
        value: 5,
        unit: "acres",
      },
      plantingDate: new Date("2024-02-01"),
      expectedHarvestDate: new Date("2024-06-30"),
      actualHarvestDate: new Date("2024-07-05"),
      status: "completed",
      currentStage: {
        name: "harvesting",
        startDate: new Date("2024-06-15"),
        status: "completed",
      },
      activities: [
        {
          date: new Date("2024-02-01"),
          type: "land-preparation",
          description: "Field cleaned and prepared with mulch",
          cost: { amount: 10000, currency: "INR" },
          labor: { hours: 25, workers: 3, cost: 2000 },
          weather: { temperature: 25, humidity: 45, rainfall: 0, conditions: "Clear" },
        },
        {
          date: new Date("2024-02-10"),
          type: "sowing",
          description: "Transplanted 5000 seedlings",
          cost: { amount: 15000, currency: "INR" },
          materials: [{ name: "Seedlings", quantity: 5000, unit: "nos", cost: 15000 }],
          weather: { temperature: 26, humidity: 50, rainfall: 0, conditions: "Sunny" },
        },
        {
          date: new Date("2024-03-15"),
          type: "fertilization",
          description: "Applied liquid fertilizer",
          cost: { amount: 8000, currency: "INR" },
          weather: { temperature: 30, humidity: 55, rainfall: 1, conditions: "Sunny" },
        },
        {
          date: new Date("2024-06-15"),
          type: "harvesting",
          description: "Started harvesting ripe tomatoes",
          cost: { amount: 12000, currency: "INR" },
          labor: { hours: 50, workers: 5, cost: 12000 },
          weather: { temperature: 32, humidity: 70, rainfall: 0, conditions: "Hot" },
        },
      ],
      economics: {
        totalInvestment: 45000,
        breakdown: {
          seeds: 15000,
          fertilizers: 8000,
          pesticides: 4000,
          labor: 14000,
          irrigation: 3000,
          equipment: 1000,
          other: 0,
        },
        revenue: {
          totalRevenue: 120000,
          pricePerUnit: 2400,
          soldQuantity: 50,
          unit: "quintals",
        },
        profit: 75000,
        roi: 166.7,
      },
      yield: {
        expected: { quantity: 40, unit: "quintals" },
        actual: {
          quantity: 50,
          unit: "quintals",
          quality: "good",
        },
      },
      tags: ["high-value-crop", "greenhouse"],
    })

    const cropDiary3 = new CropDiary({
      farmer: farmer3._id,
      farm: farm3._id,
      crop: {
        name: "Cotton",
        variety: "Bt Cotton",
        season: "kharif",
        category: "cash-crops",
      },
      area: {
        value: 20,
        unit: "acres",
      },
      plantingDate: new Date("2024-05-01"),
      expectedHarvestDate: new Date("2024-12-15"),
      status: "active",
      currentStage: {
        name: "fruit-development",
        startDate: new Date("2024-09-01"),
        status: "in-progress",
      },
      activities: [
        {
          date: new Date("2024-05-01"),
          type: "land-preparation",
          description: "Field ploughed and ridges prepared",
          cost: { amount: 25000, currency: "INR" },
          labor: { hours: 60, workers: 8, cost: 4000 },
          weather: { temperature: 35, humidity: 40, rainfall: 0, conditions: "Very Hot" },
        },
        {
          date: new Date("2024-05-15"),
          type: "sowing",
          description: "Sowed Bt cotton seeds",
          cost: { amount: 30000, currency: "INR" },
          materials: [{ name: "Bt Cotton Seeds", quantity: 10, unit: "kg", cost: 30000 }],
          weather: { temperature: 36, humidity: 42, rainfall: 1, conditions: "Hot" },
        },
        {
          date: new Date("2024-07-01"),
          type: "fertilization",
          description: "Applied phosphate fertilizer",
          cost: { amount: 18000, currency: "INR" },
          materials: [{ name: "SSP", quantity: 80, unit: "kg", cost: 18000 }],
          weather: { temperature: 32, humidity: 60, rainfall: 5, conditions: "Rainy" },
        },
      ],
      economics: {
        totalInvestment: 73000,
        breakdown: {
          seeds: 30000,
          fertilizers: 18000,
          pesticides: 15000,
          labor: 4000,
          irrigation: 5000,
          equipment: 1000,
          other: 0,
        },
        revenue: {
          totalRevenue: 0,
          pricePerUnit: 0,
          soldQuantity: 0,
          unit: "quintals",
        },
        profit: -73000,
        roi: 0,
      },
      yield: {
        expected: { quantity: 30, unit: "quintals" },
      },
      challenges: [
        {
          type: "pest",
          description: "Moderate whitefly infestation detected",
          severity: "medium",
          dateIdentified: new Date("2024-08-20"),
          resolved: true,
          resolution: "Applied neem oil spray, infestation controlled",
        },
      ],
      tags: ["bt-cotton", "cash-crop"],
    })

    // Create active crop diary
    const cropDiary4 = new CropDiary({
      farmer: farmer1._id,
      farm: farm1._id,
      crop: {
        name: "Wheat",
        variety: "HD-2967",
        season: "rabi",
        category: "cereals",
      },
      area: {
        value: 15,
        unit: "acres",
      },
      plantingDate: new Date("2024-10-20"),
      expectedHarvestDate: new Date("2025-03-30"),
      status: "active",
      currentStage: {
        name: "vegetative-growth",
        startDate: new Date("2024-11-01"),
        status: "in-progress",
      },
      activities: [
        {
          date: new Date("2024-10-20"),
          type: "land-preparation",
          description: "Field prepared and ready for sowing",
          cost: { amount: 12000, currency: "INR" },
          weather: { temperature: 28, humidity: 55, rainfall: 0, conditions: "Clear" },
        },
        {
          date: new Date("2024-10-25"),
          type: "sowing",
          description: "Sowed 60kg wheat seeds",
          cost: { amount: 6000, currency: "INR" },
          materials: [{ name: "Wheat Seeds", quantity: 60, unit: "kg", cost: 6000 }],
          weather: { temperature: 26, humidity: 50, rainfall: 2, conditions: "Cloudy" },
        },
      ],
      economics: {
        totalInvestment: 18000,
        breakdown: {
          seeds: 6000,
          fertilizers: 0,
          pesticides: 0,
          labor: 3000,
          irrigation: 4000,
          equipment: 5000,
          other: 0,
        },
        revenue: {
          totalRevenue: 0,
          pricePerUnit: 0,
          soldQuantity: 0,
          unit: "quintals",
        },
        profit: -18000,
        roi: 0,
      },
      yield: {
        expected: { quantity: 35, unit: "quintals" },
      },
      tags: ["rabi-crop", "ongoing"],
    })

    await cropDiary1.save()
    await cropDiary2.save()
    await cropDiary3.save()
    await cropDiary4.save()

    // Create notifications
    console.log("Creating sample notifications...")
    const notifications = [
      {
        recipient: farmer1._id,
        type: "harvest",
        title: "Harvest Reminder",
        message: "Your rice crop is ready for harvesting next week!",
        data: { farmId: farm1._id, cropName: "Basmati Rice" },
        priority: "high",
      },
      {
        recipient: farmer2._id,
        type: "pest-warning",
        title: "Pest Alert",
        message: "Early blight detected in your area. Take preventive measures.",
        data: { farmId: farm2._id },
        priority: "high",
      },
      {
        recipient: farmer3._id,
        type: "weather",
        title: "Weather Alert",
        message: "Heavy rainfall expected in your region. Drain excess water.",
        data: { district: "Ahmedabad" },
        priority: "medium",
      },
      {
        recipient: farmer1._id,
        type: "advisory",
        title: "Agricultural Advisory",
        message: "Expert recommendation for your wheat crop available",
        data: { farmId: farm1._id },
        priority: "medium",
        isRead: true,
      },
    ]

    for (const notif of notifications) {
      await Notification.create(notif)
    }

    console.log("Database seeding completed successfully!")
    console.log("\nSample Accounts Created:")
    console.log("Farmers:")
    console.log("- rajesh@agribuddy.com (password: password123)")
    console.log("- priya@agribuddy.com (password: password123)")
    console.log("- amit@agribuddy.com (password: password123)")
    console.log("\nExperts:")
    console.log("- expert@agribuddy.com (password: password123)")
    console.log("- expert2@agribuddy.com (password: password123)")
    console.log("\nSample Data:")
    console.log("- 3 Farms with complete information")
    console.log("- 4 Crop Diaries (3 completed, 1 active) with detailed analytics")
    console.log("- Comprehensive economics data with ROI calculations")
    console.log("- 4 Notifications for different alert types")

    await mongoose.disconnect()
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
