# AgriBuddy - Smart Crop Scheduling & Advisory App

A comprehensive MERN stack application designed to assist farmers in managing their farms efficiently through intelligent crop scheduling, localized advisory notifications, weather tracking, and activity logging.

## Features

### Core Functionality (40% Implementation)
- **User Management**: Secure registration and login with JWT authentication
- **Farm Management**: Create and manage multiple farms with detailed information
- **Crop Scheduling**: Plan and track crop planting and harvest schedules
- **Activity Logging**: Record and monitor farm activities with cost tracking
- **Advisory System**: Receive important agricultural advisories and notifications
- **Dashboard**: Comprehensive overview of farm statistics and recent activities

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
\`\`\`bash
cd server
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create a `.env` file in the server directory:
\`\`\`env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
WEATHER_API_KEY=your_weather_api_key (optional)
\`\`\`

4. Start the server:
\`\`\`bash
npm run dev
\`\`\`

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the root directory and install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the React development server:
\`\`\`bash
npm start
\`\`\`

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Farms
- `GET /api/farms` - Get all user farms
- `POST /api/farms` - Create new farm
- `GET /api/farms/:id` - Get specific farm
- `PUT /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm

### Crop Schedules
- `GET /api/schedules` - Get all schedules
- `POST /api/schedules` - Create new schedule
- `GET /api/schedules/farm/:farmId` - Get schedules for specific farm
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Activities
- `GET /api/activities` - Get all activities
- `POST /api/activities` - Log new activity
- `GET /api/activities/farm/:farmId` - Get activities for specific farm

### Advisory
- `GET /api/advisory` - Get all advisories
- `POST /api/advisory` - Create new advisory
- `GET /api/advisory/:id` - Get specific advisory

## Database Schema

### User Model
\`\`\`javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  location: String,
  farmingExperience: Number,
  farms: [ObjectId] // References to Farm documents
}
\`\`\`

### Farm Model
\`\`\`javascript
{
  name: String,
  owner: ObjectId, // Reference to User
  location: String,
  area: Number, // in acres
  soilType: String,
  irrigationType: String,
  crops: [ObjectId], // References to CropSchedule documents
  isActive: Boolean
}
\`\`\`

### CropSchedule Model
\`\`\`javascript
{
  farm: ObjectId, // Reference to Farm
  cropName: String,
  variety: String,
  plantingDate: Date,
  expectedHarvestDate: Date,
  area: Number,
  status: String, // Planned, Planted, Growing, Harvested, Failed
  activities: [ObjectId], // References to ActivityLog documents
  notes: String
}
\`\`\`

### ActivityLog Model
\`\`\`javascript
{
  farm: ObjectId, // Reference to Farm
  cropSchedule: ObjectId, // Reference to CropSchedule (optional)
  activityType: String,
  description: String,
  date: Date,
  cost: Number,
  notes: String,
  user: ObjectId // Reference to User
}
\`\`\`

### Advisory Model
\`\`\`javascript
{
  title: String,
  content: String,
  type: String, // Weather, Pest, Disease, Fertilizer, General
  priority: String, // Low, Medium, High, Critical
  targetCrops: [String],
  location: String,
  validUntil: Date,
  isActive: Boolean
}
\`\`\`

## Usage

1. **Register/Login**: Create an account or login with existing credentials
2. **Create Farm**: Add your farm details including location, area, soil type, and irrigation method
3. **Schedule Crops**: Plan your crop planting with expected harvest dates
4. **Log Activities**: Record daily farm activities with costs and notes
5. **View Advisory**: Check important agricultural advisories and notifications
6. **Monitor Dashboard**: Track your farm statistics and recent activities

## Testing

Use tools like Postman or Thunder Client to test the API endpoints:

1. Register a new user
2. Login to get JWT token
3. Use the token in Authorization header for protected routes
4. Test CRUD operations for farms, schedules, and activities

## Future Enhancements

- Weather API integration
- Mobile app development
- Advanced analytics and reporting
- Crop recommendation system
- Market price integration
- Community features
- Offline functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
