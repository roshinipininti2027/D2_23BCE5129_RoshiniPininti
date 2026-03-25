# AgriBuddy Database Setup Guide

## MongoDB Connection

Your MongoDB connection URL has been configured in the `server/.env` file:

\`\`\`
MONGODB_URI=mongodb+srv://khushia1205:khushi12@cluster0.lkwdttb.mongodb.net/agribuddy
\`\`\`

## Database Models

The following database models have been created for your AgriBuddy application:

### 1. User Model (`server/models/User.js`)
- Stores user authentication and profile information
- Includes farming experience and location data
- References to user's farms

### 2. Farm Model (`server/models/Farm.js`)
- Farm details including location, area, soil type
- References to crop schedules
- Owner relationship with users

### 3. CropSchedule Model (`server/models/CropSchedule.js`)
- Crop planting and harvest schedules
- Status tracking (Planned, Planted, Growing, Harvested, Failed)
- References to farms and activities

### 4. Crop Model (`server/models/Crop.js`) - NEW
- Master crop database with varieties
- Soil and climate requirements
- Nutritional information and market prices
- Growth periods and yield data

### 5. ActivityLog Model (`server/models/ActivityLog.js`)
- Farm activity tracking
- Cost management
- References to farms and crop schedules

### 6. Advisory Model (`server/models/Advisory.js`)
- Agricultural advisories and notifications
- Priority levels and target crops
- Validity periods

### 7. Notification Model (`server/models/Notification.js`) - NEW
- User notifications system
- Read/unread status tracking
- Scheduled notifications
- Action-required notifications

### 8. WeatherData Model (`server/models/WeatherData.js`) - NEW
- Current weather conditions
- Weather forecasts
- Weather alerts and warnings
- Location-based weather data

## Setup Instructions

1. **Install Dependencies**
   \`\`\`bash
   cd server
   npm install
   \`\`\`

2. **Environment Configuration**
   - Your `.env` file is already configured with your MongoDB URL
   - Add additional API keys as needed (Weather API, OpenCage for location)

3. **Start the Server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Database Initialization**
   - The database will be automatically created when you first run the application
   - Collections will be created as you add data through the application

## Database Features

- **Automatic Indexing**: Optimized queries for location-based searches
- **Data Validation**: Schema validation for all models
- **Relationships**: Proper references between related data
- **Timestamps**: Automatic creation and update timestamps
- **Soft Deletes**: isActive flags for data retention

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: express-validator for API input validation
- **CORS Protection**: Configured for secure cross-origin requests

Your database is now ready to support all the enhanced features of AgriBuddy!
