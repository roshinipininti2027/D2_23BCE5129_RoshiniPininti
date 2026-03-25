# AgriBuddy - Complete Setup Instructions

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone and Setup Frontend (Next.js)

\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd AgriBuddy

# Install frontend dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local

# Start the frontend development server
npm run dev
\`\`\`

The frontend will be available at `http://localhost:3000`

### 2. Setup Backend (Node.js/Express)

\`\`\`bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Create environment file
cp .env.example .env

# Edit the .env file with your MongoDB URL
# MONGODB_URI=mongodb+srv://khushia1205:khushi12@cluster0.lkwdttb.mongodb.net/agribuddy
# JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-for-security
# PORT=5000

# Start the backend development server
npm run dev
\`\`\`

The backend API will be available at `http://localhost:5000`

### 3. Production Build

\`\`\`bash
# Build the frontend for production
npm run build

# Start the production server
npm start
\`\`\`

## 🗄️ Database Configuration

Your MongoDB connection is already configured in `server/.env`:

\`\`\`env
MONGODB_URI=mongodb+srv://khushia1205:khushi12@cluster0.lkwdttb.mongodb.net/agribuddy
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-for-security
PORT=5000
\`\`\`

## 🌟 Features

### ✅ Implemented Features
- **Multi-language Support**: 8 Indian regional languages
- **Smart Location Detection**: GPS-based location with fallback
- **Strong Password Validation**: Real-time strength checking
- **Modern UI/UX**: Glassmorphism design with smooth animations
- **Responsive Design**: Works on all devices
- **Authentication**: JWT-based secure authentication
- **Farm Management**: Create and manage multiple farms
- **Dashboard**: Overview of farm statistics

### 🔧 Technical Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: JWT tokens
- **Styling**: Custom CSS with modern design patterns
- **Icons**: Lucide React
- **Notifications**: React Toastify

## 📱 Usage Instructions

### 1. Registration
- Visit `http://localhost:3000/register`
- Fill in your details with strong password
- Use location detection or enter manually
- Submit to create account

### 2. Login
- Visit `http://localhost:3000/login`
- Enter your credentials
- Access the dashboard

### 3. Dashboard
- View farm statistics
- Quick actions for common tasks
- Recent activities overview

### 4. Farm Management
- Create new farms with detailed information
- Manage soil types and irrigation methods
- Track farm activities

## 🔧 Troubleshooting

### Common Issues

1. **Build Errors**: 
   - Make sure all dependencies are installed: `npm install`
   - Clear Next.js cache: `rm -rf .next`
   - Rebuild: `npm run build`

2. **Database Connection**:
   - Verify MongoDB URL in `server/.env`
   - Check network connectivity
   - Ensure MongoDB cluster is running

3. **API Connection**:
   - Verify backend is running on port 5000
   - Check `NEXT_PUBLIC_API_URL` in `.env.local`
   - Ensure CORS is properly configured

### Development vs Production

**Development:**
\`\`\`bash
# Frontend
npm run dev

# Backend
cd server && npm run dev
\`\`\`

**Production:**
\`\`\`bash
# Build and start frontend
npm run build && npm start

# Start backend
cd server && npm start
\`\`\`

## 🌐 Environment Variables

### Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000
\`\`\`

### Backend (server/.env)
\`\`\`env
MONGODB_URI=mongodb+srv://khushia1205:khushi12@cluster0.lkwdttb.mongodb.net/agribuddy
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-for-security
PORT=5000
WEATHER_API_KEY=your-weather-api-key-here
OPENCAGE_API_KEY=your-opencage-api-key-here
\`\`\`

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway/Heroku (Backend)
1. Create new app
2. Connect GitHub repository
3. Set environment variables
4. Deploy

Your AgriBuddy application is now ready to use! 🌱
