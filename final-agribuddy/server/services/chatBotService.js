const ChatBot = require("../models/ChatBot")
const User = require("../models/User")
const WeatherData = require("../models/WeatherData")
const Farm = require("../models/Farm")
const Crop = require("../models/Crop")

class ChatBotService {
  constructor() {
    this.intents = {
      greeting: ["hello", "hi", "hey", "good morning", "good evening", "namaste"],
      weather: ["weather", "temperature", "rain", "forecast", "climate"],
      crop: ["crop", "plant", "grow", "farming", "agriculture", "harvest"],
      irrigation: ["water", "irrigation", "watering", "sprinkler", "drip"],
      pest: ["pest", "insect", "bug", "disease", "fungus", "infection"],
      fertilizer: ["fertilizer", "nutrient", "manure", "compost", "npk"],
      market: ["price", "market", "sell", "buy", "rate", "cost"],
      help: ["help", "support", "assist", "guide", "how"],
      goodbye: ["bye", "goodbye", "see you", "thanks", "thank you"],
    }

    this.responses = {
      greeting: [
        "Hello! I'm AgriBuddy, your farming assistant. How can I help you today?",
        "Hi there! Welcome to AgriBuddy. I'm here to help with all your farming questions.",
        "Namaste! I'm your agricultural assistant. What would you like to know about farming?",
      ],
      weather: [
        "I can help you with weather information! Let me get the latest forecast for your location.",
        "Weather is crucial for farming decisions. Let me check the current conditions for you.",
      ],
      crop: [
        "I'd be happy to help with crop-related questions! What specific crop information do you need?",
        "Crop management is my specialty! Tell me about your crop and I'll provide guidance.",
      ],
      irrigation: [
        "Proper irrigation is key to healthy crops. What irrigation questions do you have?",
        "Water management is crucial for farming success. How can I help with your irrigation needs?",
      ],
      pest: [
        "Pest and disease management is important for crop health. Can you describe the issue you're facing?",
        "I can help identify and manage pest problems. What symptoms are you seeing in your crops?",
      ],
      fertilizer: [
        "Proper nutrition is essential for healthy crops. What fertilizer questions do you have?",
        "I can help with fertilizer recommendations based on your crop and soil type.",
      ],
      market: [
        "Market information helps with farming decisions. What crop prices are you interested in?",
        "I can provide market insights to help you make informed selling decisions.",
      ],
      help: [
        "I'm here to help! I can assist with weather, crops, irrigation, pest control, fertilizers, and market information.",
        "I can help with various farming topics including crop management, weather forecasts, pest control, and more!",
      ],
      goodbye: [
        "Thank you for using AgriBuddy! Feel free to ask me anything about farming anytime.",
        "Goodbye! Remember, I'm always here to help with your farming questions.",
        "Take care! Don't hesitate to reach out if you need any farming assistance.",
      ],
      default: [
        "I understand you're asking about farming, but I need more specific information to help you better.",
        "That's an interesting question! Could you provide more details so I can give you the best answer?",
        "I'm here to help with farming questions. Could you be more specific about what you'd like to know?",
      ],
    }

    this.quickReplies = {
      greeting: ["Weather Forecast", "Crop Advice", "Pest Control", "Market Prices", "Talk to Expert"],
      weather: ["Today's Weather", "7-Day Forecast", "Rainfall Alert", "Temperature Trends"],
      crop: ["Crop Calendar", "Planting Guide", "Harvest Time", "Growth Stages"],
      irrigation: ["Watering Schedule", "Irrigation Tips", "Water Requirements", "Drip vs Sprinkler"],
      pest: ["Identify Pest", "Treatment Options", "Prevention Tips", "Organic Solutions"],
      fertilizer: ["NPK Requirements", "Organic Fertilizers", "Application Schedule", "Soil Testing"],
      market: ["Current Prices", "Price Trends", "Best Selling Time", "Market News"],
      help: ["Weather Info", "Crop Guidance", "Pest Control", "Expert Consultation"],
    }
  }

  // Detect intent from user message
  detectIntent(message) {
    const lowerMessage = message.toLowerCase()
    let bestMatch = { intent: "default", confidence: 0 }

    for (const [intent, keywords] of Object.entries(this.intents)) {
      let matches = 0
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          matches++
        }
      }

      const confidence = matches / keywords.length
      if (confidence > bestMatch.confidence) {
        bestMatch = { intent, confidence }
      }
    }

    return bestMatch
  }

  // Extract entities from message
  extractEntities(message) {
    const entities = []
    const lowerMessage = message.toLowerCase()

    // Extract crop names
    const crops = ["rice", "wheat", "corn", "tomato", "potato", "onion", "cotton", "sugarcane"]
    crops.forEach((crop) => {
      if (lowerMessage.includes(crop)) {
        entities.push({ entity: "crop", value: crop, confidence: 0.9 })
      }
    })

    // Extract numbers (could be area, quantity, etc.)
    const numbers = message.match(/\d+/g)
    if (numbers) {
      numbers.forEach((num) => {
        entities.push({ entity: "number", value: Number.parseInt(num), confidence: 0.8 })
      })
    }

    // Extract locations
    const locations = ["punjab", "haryana", "uttar pradesh", "bihar", "west bengal"]
    locations.forEach((location) => {
      if (lowerMessage.includes(location)) {
        entities.push({ entity: "location", value: location, confidence: 0.9 })
      }
    })

    return entities
  }

  // Generate response based on intent
  async generateResponse(intent, entities, context, user) {
    let response = ""
    let responseType = "text"
    let quickReplies = []
    const cards = []

    switch (intent) {
      case "greeting":
        response = this.getRandomResponse("greeting")
        quickReplies = this.quickReplies.greeting
        break

      case "weather":
        response = await this.handleWeatherQuery(entities, context, user)
        quickReplies = this.quickReplies.weather
        break

      case "crop":
        response = await this.handleCropQuery(entities, context, user)
        quickReplies = this.quickReplies.crop
        responseType = "quick_reply"
        break

      case "irrigation":
        response = this.handleIrrigationQuery(entities, context)
        quickReplies = this.quickReplies.irrigation
        break

      case "pest":
        response = this.handlePestQuery(entities, context)
        quickReplies = this.quickReplies.pest
        break

      case "fertilizer":
        response = this.handleFertilizerQuery(entities, context)
        quickReplies = this.quickReplies.fertilizer
        break

      case "market":
        response = await this.handleMarketQuery(entities, context)
        quickReplies = this.quickReplies.market
        break

      case "help":
        response = this.getRandomResponse("help")
        quickReplies = this.quickReplies.help
        break

      case "goodbye":
        response = this.getRandomResponse("goodbye")
        break

      default:
        response = this.getRandomResponse("default")
        quickReplies = ["Weather", "Crops", "Pest Control", "Talk to Expert"]
    }

    return {
      response,
      responseType,
      quickReplies,
      cards,
    }
  }

  // Handle weather queries
  async handleWeatherQuery(entities, context, user) {
    try {
      let location = context.userLocation

      // If no location in context, try to get from user's farms
      if (!location && user.farms && user.farms.length > 0) {
        const farm = await Farm.findById(user.farms[0])
        if (farm && farm.location && farm.location.coordinates) {
          location = {
            coordinates: farm.location.coordinates,
            address: farm.location.address,
          }
        }
      }

      if (!location) {
        return "I'd like to help with weather information! Could you please share your location or farm details so I can provide accurate weather data?"
      }

      // Get weather data
      const weatherService = require("./weatherService")
      const weather = await weatherService.getCurrentWeather(
        location.coordinates[1], // latitude
        location.coordinates[0], // longitude
      )

      if (weather) {
        return `Current weather for ${location.address || "your location"}:
🌡️ Temperature: ${weather.temperature}°C
🌤️ Conditions: ${weather.condition}
💧 Humidity: ${weather.humidity}%
💨 Wind: ${weather.windSpeed} km/h

${
  weather.alerts && weather.alerts.length > 0
    ? `⚠️ Weather Alert: ${weather.alerts[0].description}`
    : "No weather alerts for your area."
}`
      } else {
        return "I'm having trouble getting weather data right now. Please try again in a few minutes or contact our support team."
      }
    } catch (error) {
      console.error("Error handling weather query:", error)
      return "I'm having trouble accessing weather information right now. Please try again later."
    }
  }

  // Handle crop queries
  async handleCropQuery(entities, context, user) {
    const cropEntity = entities.find((e) => e.entity === "crop")

    if (cropEntity) {
      try {
        const crop = await Crop.findOne({
          name: new RegExp(cropEntity.value, "i"),
        })

        if (crop) {
          return `Here's information about ${crop.name}:

🌱 Scientific Name: ${crop.scientificName}
📅 Growing Season: ${crop.plantingDetails.season.join(", ")}
🌡️ Temperature: ${crop.climaticRequirements.temperature.min}-${crop.climaticRequirements.temperature.max}°C
💧 Rainfall: ${crop.climaticRequirements.rainfall.annual.min}-${crop.climaticRequirements.rainfall.annual.max}mm
🌾 Maturity: ${crop.harvestDetails.maturityDays.min}-${crop.harvestDetails.maturityDays.max} days
📈 Yield: ${crop.harvestDetails.yieldPotential.min}-${crop.harvestDetails.yieldPotential.max} ${crop.harvestDetails.yieldPotential.unit}

Would you like specific guidance on planting, care, or harvesting?`
        }
      } catch (error) {
        console.error("Error fetching crop data:", error)
      }
    }

    return `I can help with crop information! Here are some common crops I can assist with:
🌾 Rice - Best practices and varieties
🌽 Wheat - Planting and harvesting tips  
🥔 Vegetables - Seasonal growing guides
🌿 Cash crops - Market-oriented farming

What specific crop would you like to know about?`
  }

  // Handle irrigation queries
  handleIrrigationQuery(entities, context) {
    return `Here are some irrigation tips for better water management:

💧 **Drip Irrigation**: Most efficient, saves 30-50% water
🌊 **Sprinkler System**: Good for large areas, uniform distribution
⏰ **Timing**: Early morning (6-8 AM) or evening (6-8 PM)
📏 **Frequency**: Deep, less frequent watering is better than shallow, frequent watering

**Signs your crops need water:**
• Soil feels dry 2-3 inches deep
• Leaves appear wilted in morning
• Slower growth rate

Would you like specific irrigation schedules for your crops?`
  }

  // Handle pest queries
  handlePestQuery(entities, context) {
    return `I can help with pest and disease management! Here's a general approach:

🔍 **Identification**: 
• Check leaves, stems, and roots regularly
• Look for holes, discoloration, or unusual growth
• Note the time of day pests are most active

🛡️ **Prevention**:
• Crop rotation every season
• Maintain proper plant spacing
• Remove infected plant debris
• Use companion planting

🌿 **Organic Solutions**:
• Neem oil spray for aphids and whiteflies
• Bacillus thuringiensis for caterpillars
• Diatomaceous earth for crawling insects

Can you describe the specific pest problem you're facing? I can provide targeted solutions.`
  }

  // Handle fertilizer queries
  handleFertilizerQuery(entities, context) {
    return `Here's guidance on fertilizer management:

🧪 **NPK Basics**:
• N (Nitrogen): Leaf growth, green color
• P (Phosphorus): Root development, flowering
• K (Potassium): Disease resistance, fruit quality

📅 **Application Schedule**:
• Base dose: Before planting
• First top dressing: 20-25 days after planting
• Second top dressing: 40-45 days after planting

🌿 **Organic Options**:
• Compost: Slow-release nutrients
• Vermicompost: Rich in micronutrients
• Green manure: Nitrogen fixation

💡 **Tips**:
• Soil test before fertilizing
• Apply during cool hours
• Water after application

What crop are you fertilizing? I can provide specific recommendations.`
  }

  // Handle market queries
  async handleMarketQuery(entities, context) {
    const cropEntity = entities.find((e) => e.entity === "crop")

    let response = `Here's current market information:

📈 **General Market Trends**:
• Organic produce: 20-30% premium prices
• Direct selling: Better margins than middlemen
• Contract farming: Assured prices

💰 **Price Factors**:
• Quality grade (A, B, C)
• Market demand and supply
• Transportation costs
• Seasonal variations

📍 **Best Selling Channels**:
• Local mandis (wholesale markets)
• Direct to retailers
• Online platforms
• Food processing companies`

    if (cropEntity) {
      response += `\n\n🌾 For ${cropEntity.value}:
• Check local mandi prices daily
• Consider value addition (processing)
• Time harvest based on market demand`
    }

    response += `\n\nWould you like specific price information for your area?`

    return response
  }

  // Get random response from array
  getRandomResponse(type) {
    const responses = this.responses[type] || this.responses.default
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // Process user message and generate response
  async processMessage(sessionId, message, userId) {
    try {
      // Get or create chat session
      let session = await ChatBot.findOne({ sessionId })
      if (!session) {
        const user = await User.findById(userId)
        session = await ChatBot.createSession(userId)
      }

      // Get user data
      const user = await User.findById(userId).populate("farms")

      // Detect intent and extract entities
      const intentResult = this.detectIntent(message)
      const entities = this.extractEntities(message)

      // Generate response
      const responseData = await this.generateResponse(intentResult.intent, entities, session.context, user)

      // Add user message to session
      await session.addMessage("user", message, {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities: entities,
      })

      // Add bot response to session
      await session.addMessage("bot", responseData.response, {
        responseType: responseData.responseType,
        quickReplies: responseData.quickReplies,
        cards: responseData.cards,
      })

      return {
        response: responseData.response,
        responseType: responseData.responseType,
        quickReplies: responseData.quickReplies,
        cards: responseData.cards,
        sessionId: session.sessionId,
      }
    } catch (error) {
      console.error("Error processing chatbot message:", error)
      return {
        response:
          "I'm sorry, I'm having trouble processing your request right now. Please try again or contact our support team.",
        responseType: "text",
        quickReplies: ["Try Again", "Talk to Expert"],
        sessionId: sessionId,
      }
    }
  }

  // Start new chat session
  async startSession(userId) {
    try {
      const session = await ChatBot.createSession(userId)
      const welcomeResponse = this.getRandomResponse("greeting")

      await session.addMessage("bot", welcomeResponse, {
        responseType: "quick_reply",
        quickReplies: this.quickReplies.greeting,
      })

      return {
        sessionId: session.sessionId,
        response: welcomeResponse,
        responseType: "quick_reply",
        quickReplies: this.quickReplies.greeting,
      }
    } catch (error) {
      console.error("Error starting chat session:", error)
      throw error
    }
  }

  // Escalate to expert
  async escalateToExpert(sessionId, reason) {
    try {
      const session = await ChatBot.findOne({ sessionId })
      if (!session) {
        throw new Error("Session not found")
      }

      // Find available expert
      const expert = await User.findOne({
        role: "expert",
        isActive: true,
      }).sort({ "expertise.consultationsHandled": 1 })

      if (expert) {
        await session.escalateToExpert(reason, expert._id)

        // Create consultation
        const Consultation = require("../models/Consultation")
        const consultation = await Consultation.create({
          title: "Chatbot Escalation",
          description: `User escalated from chatbot session. Reason: ${reason}`,
          category: "general",
          urgency: "medium",
          farmer: session.user,
          expert: expert._id,
          status: "assigned",
        })

        session.escalated.consultation = consultation._id
        await session.save()

        return {
          success: true,
          message: `I've connected you with ${expert.name}, an agricultural expert. They will respond to your query soon. You can also check your consultations page for updates.`,
          expertName: expert.name,
          consultationId: consultation._id,
        }
      } else {
        return {
          success: false,
          message:
            "I'm sorry, no experts are available right now. Please try again later or submit your question through the consultation form.",
        }
      }
    } catch (error) {
      console.error("Error escalating to expert:", error)
      throw error
    }
  }

  // Add feedback
  async addFeedback(sessionId, helpful, rating, comment) {
    try {
      const session = await ChatBot.findOne({ sessionId })
      if (!session) {
        throw new Error("Session not found")
      }

      const messageIndex = session.messages.length - 1
      await session.addFeedback(messageIndex, {
        helpful,
        rating,
        comment,
      })

      return { success: true }
    } catch (error) {
      console.error("Error adding feedback:", error)
      throw error
    }
  }
}

module.exports = new ChatBotService()
