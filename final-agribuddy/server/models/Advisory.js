const mongoose = require("mongoose")

const AdvisorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    summary: {
      type: String,
      required: true,
      maxlength: 500
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: String,
      enum: [
        "crop_management",
        "pest_control",
        "disease_management", 
        "soil_health",
        "irrigation",
        "fertilization",
        "weather_advisory",
        "market_information",
        "post_harvest",
        "organic_farming",
        "sustainable_practices",
        "government_schemes",
        "technology",
        "general"
      ],
      required: true
    },
    subcategory: String,
    targetCrops: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Crop"
    }],
    targetRegions: [{
      state: String,
      districts: [String]
    }],
    season: {
      type: String,
      enum: ["kharif", "rabi", "zaid", "all_seasons"]
    },
    urgency: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium"
    },
    validFrom: {
      type: Date,
      required: true,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: true
    },
    language: {
      type: String,
      enum: ["en", "hi", "bn", "ta", "te", "mr", "gu", "pa", "kn"],
      default: "en"
    },
    translations: [{
      language: {
        type: String,
        enum: ["en", "hi", "bn", "ta", "te", "mr", "gu", "pa", "kn"]
      },
      title: String,
      content: String,
      summary: String
    }],
    tags: [String],
    weatherDependency: {
      isWeatherDependent: {
        type: Boolean,
        default: false
      },
      conditions: [{
        parameter: {
          type: String,
          enum: ["temperature", "rainfall", "humidity", "wind_speed"]
        },
        operator: {
          type: String,
          enum: ["greater_than", "less_than", "between", "equals"]
        },
        value: Number,
        maxValue: Number // for 'between' operator
      }]
    },
    actionItems: [{
      action: {
        type: String,
        required: true
      },
      priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Medium"
      },
      timeframe: String,
      materials: [String],
      estimatedCost: Number
    }],
    multimedia: {
      images: [{
        url: String,
        caption: String,
        alt_text: String
      }],
      videos: [{
        url: String,
        title: String,
        duration: Number,
        thumbnail: String
      }],
      documents: [{
        url: String,
        title: String,
        type: String,
        size: Number
      }],
      audio: [{
        url: String,
        title: String,
        duration: Number,
        language: String
      }]
    },
    sources: [{
      type: {
        type: String,
        enum: ["research_paper", "government_publication", "expert_opinion", "field_study", "other"]
      },
      title: String,
      author: String,
      publication: String,
      url: String,
      date: Date
    }],
    targetAudience: {
      experience_level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced", "all"]
      },
      farm_size: {
        type: String,
        enum: ["small", "medium", "large", "all"]
      },
      farming_type: {
        type: String,
        enum: ["organic", "conventional", "mixed", "all"]
      }
    },
    engagement: {
      views: {
        type: Number,
        default: 0
      },
      likes: {
        type: Number,
        default: 0
      },
      shares: {
        type: Number,
        default: 0
      },
      bookmarks: {
        type: Number,
        default: 0
      },
      comments: {
        type: Number,
        default: 0
      }
    },
    feedback: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      helpful: {
        type: Boolean,
        default: false
      },
      implemented: {
        type: Boolean,
        default: false
      },
      results: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    relatedAdvisories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Advisory"
    }],
    expertVerification: {
      isVerified: {
        type: Boolean,
        default: false
      },
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      verificationDate: Date,
      verificationNotes: String
    },
    status: {
      type: String,
      enum: ["Draft", "Under_Review", "Published", "Archived", "Expired"],
      default: "Draft"
    },
    publishedDate: Date,
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    },
    changeLog: [{
      version: Number,
      changes: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      date: Date
    }],
    notifications: {
      sent: {
        type: Boolean,
        default: false
      },
      sentDate: Date,
      recipients: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        delivered: Boolean,
        read: Boolean,
        readDate: Date
      }]
    },
    seoMetadata: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      slug: String
    },
    analytics: {
      impressions: {
        type: Number,
        default: 0
      },
      clicks: {
        type: Number,
        default: 0
      },
      ctr: {
        type: Number,
        default: 0
      },
      avgTimeSpent: Number,
      bounceRate: Number
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isPremium: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  },
)

// Indexes for efficient querying
AdvisorySchema.index({ category: 1, status: 1, validUntil: 1 })
AdvisorySchema.index({ targetRegions: 1, season: 1 })
AdvisorySchema.index({ author: 1, createdAt: -1 })
AdvisorySchema.index({ tags: 1, language: 1 })
AdvisorySchema.index({ urgency: 1, validFrom: 1 })
AdvisorySchema.index({ "engagement.views": -1 })

// Text index for search functionality
AdvisorySchema.index({
  title: "text",
  content: "text",
  summary: "text",
  tags: "text"
})

// Virtual for average rating
AdvisorySchema.virtual("averageRating").get(function() {
  if (this.feedback.length === 0) return 0
  
  const totalRating = this.feedback.reduce((sum, fb) => sum + (fb.rating || 0), 0)
  return Math.round((totalRating / this.feedback.length) * 10) / 10
})

// Virtual for implementation rate
AdvisorySchema.virtual("implementationRate").get(function() {
  if (this.feedback.length === 0) return 0
  
  const implementedCount = this.feedback.filter(fb => fb.implemented).length
  return Math.round((implementedCount / this.feedback.length) * 100)
})

// Virtual for helpfulness rate
AdvisorySchema.virtual("helpfulnessRate").get(function() {
  if (this.feedback.length === 0) return 0
  
  const helpfulCount = this.feedback.filter(fb => fb.helpful).length
  return Math.round((helpfulCount / this.feedback.length) * 100)
})

// Method to check if advisory is currently valid
AdvisorySchema.methods.isCurrentlyValid = function() {
  const now = new Date()
  return this.validFrom <= now && now <= this.validUntil && this.status === "Published"
}

// Method to check if advisory is applicable for given conditions
AdvisorySchema.methods.isApplicableFor = function(conditions) {
  const { region, crops, season, language } = conditions
  
  let applicable = true
  
  // Check region
  if (this.targetRegions.length > 0 && region) {
    applicable = this.targetRegions.some(tr => 
      tr.state === region.state && 
      (tr.districts.length === 0 || tr.districts.includes(region.district))
    )
  }
  
  // Check crops
  if (this.targetCrops.length > 0 && crops && crops.length > 0) {
    applicable = applicable && this.targetCrops.some(tc => 
      crops.includes(tc.toString())
    )
  }
  
  // Check season
  if (this.season && this.season !== "all_seasons" && season) {
    applicable = applicable && this.season === season
  }
  
  // Check language
  if (language && this.language !== language) {
    applicable = applicable && this.translations.some(t => t.language === language)
  }
  
  return applicable
}

// Method to get content in specified language
AdvisorySchema.methods.getLocalizedContent = function(language = "en") {
  if (this.language === language) {
    return {
      title: this.title,
      content: this.content,
      summary: this.summary
    }
  }
  
  const translation = this.translations.find(t => t.language === language)
  if (translation) {
    return {
      title: translation.title,
      content: translation.content,
      summary: translation.summary
    }
  }
  
  // Fallback to original language
  return {
    title: this.title,
    content: this.content,
    summary: this.summary
  }
}

// Method to increment view count
AdvisorySchema.methods.incrementViews = function() {
  this.engagement.views += 1
  this.analytics.impressions += 1
  return this.save()
}

// Method to add feedback
AdvisorySchema.methods.addFeedback = function(userId, feedbackData) {
  this.feedback.push({
    user: userId,
    ...feedbackData,
    date: new Date()
  })
  
  this.engagement.comments += 1
  return this.save()
}

// Static method to get trending advisories
AdvisorySchema.statics.getTrending = function(limit = 10) {
  return this.find({ 
    status: "Published",
    validUntil: { $gte: new Date() }
  })
  .sort({ 
    "engagement.views": -1,
    "engagement.likes": -1,
    createdAt: -1
  })
  .limit(limit)
  .populate("author", "name expertise")
}

// Static method to get advisories by region and crops
AdvisorySchema.statics.getRelevantAdvisories = function(conditions, limit = 20) {
  const { region, crops, season, language = "en" } = conditions
  
  const query = {
    status: "Published",
    validUntil: { $gte: new Date() },
    validFrom: { $lte: new Date() }
  }
  
  // Add region filter
  if (region) {
    query.$or = [
      { targetRegions: { $size: 0 } },
      {
        "targetRegions.state": region.state,
        $or: [
          { "targetRegions.districts": { $size: 0 } },
          { "targetRegions.districts": region.district }
        ]
      }
    ]
  }
  
  // Add crops filter
  if (crops && crops.length > 0) {
    query.$and = query.$and || []
    query.$and.push({
      $or: [
        { targetCrops: { $size: 0 } },
        { targetCrops: { $in: crops } }
      ]
    })
  }
  
  // Add season filter
  if (season) {
    query.$and = query.$and || []
    query.$and.push({
      $or: [
        { season: "all_seasons" },
        { season: season }
      ]
    })
  }
  
  return this.find(query)
    .sort({ urgency: -1, createdAt: -1 })
    .limit(limit)
    .populate("author", "name expertise")
    .populate("targetCrops", "name category")
}

// Pre-save middleware
AdvisorySchema.pre("save", function(next) {
  // Update lastUpdated
  this.lastUpdated = new Date()
  
  // Generate slug if not exists
  if (!this.seoMetadata.slug) {
    this.seoMetadata.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
  
  // Set published date when status changes to Published
  if (this.isModified('status') && this.status === 'Published' && !this.publishedDate) {
    this.publishedDate = new Date()
  }
  
  next()
})

module.exports = mongoose.model("Advisory", AdvisorySchema)
