# TravelJoy - AI Travel Planner ✈️

> An intelligent mobile application that simplifies travel planning by using AI to generate personalized multi-day travel schedules.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![React Native](https://img.shields.io/badge/React%20Native-v0.81-blue)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-v5.9-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Package Manager](https://img.shields.io/badge/package%20manager-yarn-2C8EBB)

---

## 📋 Table of Contents
- [📼 Demo](#-demo) - Walkthrough the app user journey 
- [🚀 How to Run the App](#-how-to-run-the-app) - Complete setup and running instructions
- [🔄 How to Update the App](#-how-to-update-the-app) - Update dependencies and code
- [⚙️ Environment Configuration](#️-environment-configuration) - API keys and settings
- [💻 Development Commands](#-development-commands-reference) - Useful commands
- [🧪 Testing](#-testing-the-app) - How to test features
- [🐛 Troubleshooting](#-troubleshooting-common-issues) - Common problems & solutions
- [📱 Features](#-features-overview) - What the app does
- [🏗️ Technical Architecture](#️-technical-architecture) - Technologies used
- [📚 Additional Documentation](#-additional-documentation) - More resources

---

## 📼 Demo



https://github.com/user-attachments/assets/031b8aba-5e9b-4fe9-b459-0da9af488316




## 🚀 How to Run the App

Follow these instructions to get TravelJoy running on your machine.

### Prerequisites

Before starting, ensure you have installed:

- ✅ **Node.js 18+** - [Download here](https://nodejs.org/)
  ```bash
  node --version  # Should show v18 or higher
  ```

- ✅ **Yarn Package Manager** - [Install here](https://yarnpkg.com/)
  ```bash
  npm install -g yarn
  yarn --version  # Should show v1.22+
  ```
  **Note:** This project uses Yarn exclusively for consistent dependency management.

- ✅ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop)
  ```bash
  docker --version  # Verify Docker is installed
  ```

- ✅ **iOS Simulator** (Mac only) or **Android Studio** (all platforms)
  - Mac: Comes with Xcode (install from App Store)
  - Windows/Linux: [Install Android Studio](https://developer.android.com/studio)

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone <your-repo-url>
cd travelJoy
```

### Step 2: Start Database Services

Open a terminal in the project root and run:

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d

# Verify services are running
docker ps
# You should see: traveljoy-postgres and traveljoy-redis containers running
```

**✅ Success indicators:**
- Both containers should show "Up" status
- No error messages in the output

**Troubleshooting:**
- If port 5432 is already in use: `docker-compose down` and check other Postgres instances
- If Docker isn't starting: Make sure Docker Desktop is running

### Step 3: Setup Backend API

Open a **new terminal window** and run:

```bash
# Navigate to backend folder
cd backend

# Install dependencies (this may take 2-3 minutes)
yarn install

# Create environment file (if it doesn't exist)
cp .env.example .env
# Edit .env if needed (default values work for local development)

# Generate Prisma client
yarn prisma:generate

# Run database migrations (creates tables)
yarn prisma:migrate

# Start the backend server
yarn dev
```

**✅ Success indicators:**
- You should see: `Server running on port 3000`
- API is ready at: `http://localhost:3000`
- No error messages

**Keep this terminal running!**

### Step 4: Setup Mobile App

Open **another new terminal window** and run:

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies (this may take 3-5 minutes)
yarn install

# Create .env file (if it doesn't exist)
cp .env.example .env
# Or manually create with: echo 'API_URL=http://localhost:3000' > .env

# For physical device testing, update .env with your computer's IP:
# API_URL=http://192.168.1.XXX:3000

# Start Expo development server
yarn start
```

**✅ Success indicators:**
- You should see a QR code in the terminal
- Expo DevTools should open in your browser
- Message: "Metro waiting on exp://..."

**Keep this terminal running too!**

### Step 5: Launch the App

You now have 3 options to run the app:

#### Option A: iOS Simulator (Mac only) - Recommended

In the Expo terminal, press:
```
i
```

The iOS Simulator will open automatically and install the app.

**First time setup:**
- Allow 1-2 minutes for the initial build
- The app will automatically reload when ready

#### Option B: Android Emulator (All platforms)

1. **First, start an Android emulator:**
   - Open Android Studio
   - Go to: Tools → Device Manager
   - Create/Start a virtual device (if you haven't already)

2. **Then in the Expo terminal, press:**
   ```
   a
   ```

The app will install on the Android emulator.

#### Option C: Physical Device with Expo Go

1. **Install Expo Go app:**
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Scan the QR code:**
   - iOS: Use Camera app to scan the QR code in terminal
   - Android: Open Expo Go app and scan with built-in scanner

3. **Important for physical devices:**
   - Update `mobile/.env` with your computer's local IP address
   - Find your IP: `ifconfig | grep "inet " | grep -v 127.0.0.1` (Mac/Linux)
   - Or: `ipconfig | findstr IPv4` (Windows)

### Step 6: Verify Everything is Working

You should now see the TravelJoy login screen!

**Test the app:**
1. **Create an account:**
   - Tap "Sign Up"
   - Enter your details
   - Tap "Create Account"

2. **Explore the app:**
   - Browse destinations on the Explore screen
   - Create a trip
   - View trip details with timeline

### Quick Start (All-in-One)

If you've already set up the project before:

```bash
# Terminal 1: Start databases
docker-compose up -d

# Terminal 2: Start backend
cd backend && yarn dev

# Terminal 3: Start mobile app
cd mobile && yarn start
# Then press 'i' for iOS or 'a' for Android
```

---

## 🔄 How to Update the App

Follow these instructions to update the TravelJoy application with the latest changes.

### Updating Dependencies

#### Update Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Check for outdated packages
yarn outdated

# Update all dependencies to latest versions
yarn upgrade

# Or update specific package
yarn upgrade <package-name>@latest

# After updating, regenerate Prisma client
yarn prisma:generate

# If database schema changed, run migrations
yarn prisma:migrate
```

#### Update Mobile Dependencies

```bash
# Navigate to mobile folder
cd mobile

# Check for outdated packages
yarn outdated

# Update all dependencies to latest versions
yarn upgrade

# Or update specific package
yarn upgrade <package-name>@latest

# Clear Metro bundler cache after updates
yarn start --clear
```

### Updating from Git Repository

#### Pull Latest Changes

```bash
# Navigate to project root
cd travelJoy

# Pull latest changes from repository
git pull origin main

# Or if you're on a different branch
git pull origin <branch-name>
```

#### After Pulling Changes

**1. Update Backend:**
```bash
cd backend

# Install any new dependencies
yarn install

# Regenerate Prisma client (if schema changed)
yarn prisma:generate

# Run new migrations (if any)
yarn prisma:migrate

# Restart the server
yarn dev
```

**2. Update Mobile:**
```bash
cd mobile

# Install any new dependencies
yarn install

# Clear cache and restart
yarn start --clear
```

### Updating Database Schema

If the database schema has been updated:

```bash
cd backend

# Generate Prisma client with new schema
yarn prisma:generate

# Create and apply new migration
yarn prisma:migrate

# Or if you need to reset the database (⚠️ deletes all data)
yarn prisma:migrate:reset
```

### Updating Environment Variables

If new environment variables were added:

**Backend:**
```bash
cd backend

# Check .env.example for new variables
cat .env.example

# Update your .env file with new variables
# Edit .env file manually or:
cp .env.example .env  # (⚠️ This overwrites your existing .env)
# Then manually add back your API keys and secrets
```

**Mobile:**
```bash
cd mobile

# Check .env.example for new variables
cat .env.example

# Update your .env file with new variables
# Or copy the example: cp .env.example .env
```

### Updating Docker Services

If `docker-compose.yml` was updated:

```bash
# Stop existing containers
docker-compose down

# Pull latest images (if specified)
docker-compose pull

# Start with new configuration
docker-compose up -d

# Check logs if needed
docker-compose logs -f
```

### Complete Update Workflow

Here's the complete workflow for updating everything:

```bash
# 1. Pull latest code
git pull origin main

# 2. Update databases (if docker-compose.yml changed)
docker-compose down
docker-compose up -d

# 3. Update backend
cd backend
yarn install
yarn prisma:generate
yarn prisma:migrate
# Restart: yarn dev

# 4. Update mobile
cd ../mobile
yarn install
yarn start --clear
```

### Troubleshooting Updates

**Issue: "Module not found" after update**
```bash
# Clear node_modules and reinstall
rm -rf node_modules yarn.lock
yarn install
```

**Issue: "Prisma client not generated"**
```bash
cd backend
yarn prisma:generate
```

**Issue: "Database migration failed"**
```bash
cd backend
# Check migration status
yarn prisma:migrate status

# If needed, reset and reapply (⚠️ deletes data)
yarn prisma:migrate:reset
```

**Issue: "Expo cache issues"**
```bash
cd mobile
yarn start --clear
# Or completely reset
rm -rf node_modules .expo
yarn install
yarn start --clear
```

### Version Compatibility

Always check these compatibility requirements:

- **Node.js**: 18+ required
- **PostgreSQL**: 12+ (Docker uses 15)
- **Redis**: 6+ (Docker uses 7)
- **Expo SDK**: 54
- **React Native**: 0.81

### Updating to Major Versions

⚠️ **Warning**: Major version updates may require code changes.

**Before updating major versions:**
1. Check the changelog for breaking changes
2. Test in a separate branch
3. Update dependencies one at a time
4. Test thoroughly before merging

**Example - Updating Expo SDK:**
```bash
# Check current version
yarn list expo

# Read migration guide
# https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/

# Update following the Expo upgrade guide
yarn upgrade expo
```

---

## 📋 Table of Contents

- [Quick Start Guide](#-quick-start-guide) - Detailed setup instructions
- [Environment Configuration](#️-environment-configuration) - API keys and settings
- [Development Commands](#-development-commands-reference) - Useful commands
- [Testing](#-testing-the-app) - How to test features
- [Troubleshooting](#-troubleshooting-common-issues) - Common problems & solutions
- [Features](#-features-overview) - What the app does
- [Tech Stack](#️-technical-architecture) - Technologies used
- [Contributing](#-contributing) - How to contribute
- [Deployment](#-production-deployment) - Deploy to production

---

## 🎉 Latest Updates

**Infrastructure Improvements & Production Ready! (Dec 23, 2025)**

Major infrastructure improvements for production readiness:
- ✅ **Package Manager Standardization** - Yarn-only project for consistent dependencies
- ✅ **Environment Templates** - Comprehensive .env.example files for easy setup
- ✅ **Docker Optimization** - Fixed Redis healthcheck and improved configurations
- ✅ **Enhanced Documentation** - Complete setup guides and troubleshooting
- ✅ **Production Ready** - All systems tested and optimized for deployment

**Frontend UI Implementation Complete! (Nov 24, 2025)**

The mobile app features a beautiful, modern UI with:
- ✨ **Modern Design System** - Turquoise/Teal theme with consistent styling
- 🏠 **Explore Screen** - Beautiful destination cards with search and filters
- ✈️ **Enhanced Trip Creation** - Visual budget slider and modern preferences
- 🗺️ **Redesigned Trip Details** - Hero map view, timeline activities, budget tracker
- 🔐 **Polished Authentication** - Beautiful login/register screens
- 🧭 **Improved Navigation** - Modern tab bar with shadows and icons

📖 See [INFRASTRUCTURE_FIXES_APPLIED.md](./INFRASTRUCTURE_FIXES_APPLIED.md) for infrastructure details.

---

## 🐛 Troubleshooting Common Issues

### Issue: "Cannot connect to backend"

**Solution:**
```bash
# 1. Check backend is running (terminal 1)
# Should see: "Server running on port 3000"

# 2. Check database is running
docker ps
# Should see postgres and redis containers

# 3. Restart backend
cd backend
npm run dev
```

---

### Issue: "Module not found" or package errors

**Solution:**
```bash
# Clear node_modules and reinstall
cd mobile
rm -rf node_modules
yarn install

# Clear Metro bundler cache
yarn start --clear
```

---

### Issue: iOS Simulator not opening

**Solution:**
1. Open Xcode once to accept licenses: `sudo xcodebuild -license accept`
2. In terminal: `yarn start` then press `i`
3. If still not working: `open -a Simulator` manually

---

### Issue: Android emulator connection issues

**Solution:**
```bash
# Check if emulator is running
adb devices
# Should show your emulator

# Restart Expo with cleared cache
yarn start --clear
# Press 'a' again
```

---

### Issue: "expo command not found"

**Solution:**
```bash
# Expo CLI is now built into the project, use yarn:
yarn start

# The project uses Expo SDK 54 which doesn't require global CLI
```

---

## 🔄 Daily Development Workflow

Once everything is set up (see [How to Run the App](#-how-to-run-the-app)), here's how to start your development session:

```bash
# Terminal 1: Start databases (only if not already running)
docker-compose up -d

# Terminal 2: Start backend
cd backend
yarn dev

# Terminal 3: Start mobile app
cd mobile
yarn start
# Then press 'i' for iOS or 'a' for Android
```

**Note:** For first-time setup, see the complete [How to Run the App](#-how-to-run-the-app) guide above.

---

## 📱 Hot Reload & Development Tips

- **Code changes auto-reload** - Edit any file and see changes instantly
- **Shake device** for developer menu (physical device)
- **Cmd+D** (iOS) or **Cmd+M** (Android) for developer menu (simulator)
- **Press 'r'** in Expo terminal to manually reload
- **Press 'j'** to open Chrome debugger

---

## 🛑 Stopping the App

```bash
# Stop Expo (Terminal 3)
Ctrl+C

# Stop Backend (Terminal 2)
Ctrl+C

# Stop Databases (Terminal 1)
docker-compose down
```

---

## 📦 Project Structure

```
TravelJoy/
├── mobile/              # React Native app with Expo
│   ├── src/
│   │   ├── screens/    # App screens (Login, Explore, etc.)
│   │   ├── components/ # Reusable components
│   │   ├── navigation/ # Navigation configuration
│   │   ├── services/   # API calls
│   │   └── theme/      # Colors, typography, spacing
│   └── App.tsx         # App entry point
│
├── backend/            # Node.js/Express API server
│   ├── src/
│   │   ├── routes/     # API endpoints
│   │   ├── services/   # Business logic
│   │   └── middleware/ # Auth, error handling
│   └── prisma/         # Database schema
│
├── docker-compose.yml  # Database services
└── README.md
```

## ⚙️ Environment Configuration

### Backend Environment Variables

The backend needs a `.env` file in the `backend/` directory:

```bash
# Navigate to backend folder
cd backend

# Copy example file
cp .env.example .env
```

**Default `.env` for local development:**

```env
# Database (Docker defaults)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/traveljoy"

# Redis (Docker defaults)
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT Secret (change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Server
PORT=3000
NODE_ENV="development"

# Optional API Keys (features work without these)
OPENWEATHER_API_KEY=""
STRIPE_SECRET_KEY=""
```

**Getting Optional API Keys:**

1. **OpenWeatherMap** (for weather features):
   - Sign up at: https://openweathermap.org/api
   - Get free API key
   - Add to `.env`: `OPENWEATHER_API_KEY="your_key_here"`

2. **Stripe** (for payment features):
   - Sign up at: https://stripe.com
   - Get test API key from dashboard
   - Add to `.env`: `STRIPE_SECRET_KEY="sk_test_..."`

---

### Mobile Environment Variables

The mobile app needs a `.env` file in the `mobile/` directory:

```bash
# Navigate to mobile folder
cd mobile

# Create .env file
echo 'EXPO_PUBLIC_API_URL=http://localhost:3000' > .env
```

**For physical device testing:**
```env
# Replace with your computer's local IP address
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000
```

**To find your local IP:**
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr IPv4
```

---

## 💻 Development Commands Reference

### Backend Commands

```bash
cd backend

# Development
yarn dev                 # Start dev server with hot reload
yarn build               # Compile TypeScript to JavaScript
yarn start               # Start production server

# Database
yarn prisma:generate     # Generate Prisma client after schema changes
yarn prisma:migrate      # Create and run new migration
yarn prisma:studio       # Open Prisma Studio (database GUI)

# Testing
yarn test                # Run tests
yarn test:watch          # Run tests in watch mode
```

### Mobile Commands

```bash
cd mobile

# Development
yarn start               # Start Expo dev server
yarn ios                 # Start and open iOS simulator
yarn android             # Start and open Android emulator
yarn web                 # Run in web browser (experimental)

# Troubleshooting
yarn start --clear       # Clear Metro bundler cache
yarn expo doctor         # Check for common issues
yarn expo install        # Fix package versions
```

---

## 🧪 Testing the App

### Manual Testing Checklist

Once the app is running, test these key features:

#### ✅ Authentication Flow
1. **Register new account:**
   - Tap "Sign Up"
   - Fill in: First name, Last name, Email, Password
   - Should see "Success" message
   
2. **Login:**
   - Enter email and password
   - Tap "Sign In"
   - Should navigate to Explore screen

3. **Logout:**
   - Go to Profile tab
   - Tap "Logout"
   - Should return to Login screen

#### ✅ Explore Destinations
1. **Browse destinations:**
   - View destination cards with images
   - See prices and ratings
   
2. **Search:**
   - Tap search bar
   - Type destination name
   - Results should filter

3. **Filter by category:**
   - Tap category chips (Beach, Mountain, etc.)
   - Destinations should filter

#### ✅ Create a Trip
1. **Start trip creation:**
   - Tap "+" or "Create Trip"
   - Enter destination (e.g., "Paris, France")
   - Set budget with slider
   - Select dates
   - Choose preferences (activities, food, transport)
   - Tap "Generate Trip"

2. **View generated trip:**
   - Should see trip details with:
     - Map view
     - Daily activities
     - Budget breakdown
     - Weather info

#### ✅ Manage Trips
1. **View trip history:**
   - Go to "My Trips" tab
   - See list of created trips

2. **Edit activity:**
   - Tap on an activity
   - Edit details
   - Save changes

3. **Delete trip:**
   - Swipe left on trip (iOS)
   - Or long-press (Android)
   - Confirm deletion

---

### API Testing

Test backend endpoints with curl or Postman:

```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🔍 Debugging Tips

### View Console Logs

**Mobile App:**
```bash
# In Expo terminal, press 'j' to open debugger
# Then open Chrome DevTools Console
```

**Backend:**
```bash
# Logs appear in the terminal where you ran 'npm run dev'
```

### Common Development Issues

#### Issue: "Can't find variable: process"
**Solution:** Add to `metro.config.js`:
```javascript
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

#### Issue: API calls fail from mobile app
**Solution:**
1. Check backend is running: `curl http://localhost:3000/api/health`
2. Check `.env` in mobile folder has correct API_URL
3. On physical device, use local IP instead of localhost

#### Issue: Database connection errors
**Solution:**
```bash
# Check Docker containers are running
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker logs traveljoy-postgres
```

---

## 📱 Features Overview

### Core Features (Available Now)

- ✅ **User Authentication**
  - Email/password registration and login
  - JWT-based secure authentication
  - Password reset functionality

- ✅ **Destination Discovery**
  - Browse curated travel destinations
  - Search by location name
  - Filter by category (Beach, Mountain, City, etc.)
  - View destination details with images and pricing

- ✅ **AI-Powered Trip Planning**
  - Generate personalized multi-day itineraries
  - Smart activity recommendations
  - Optimized daily schedules
  - Budget-aware planning

- ✅ **Trip Management**
  - View trip timeline with daily activities
  - Interactive map view of locations
  - Edit or remove activities
  - Track trip budget and expenses

- ✅ **Weather Integration**
  - Real-time weather data for destinations
  - Forecast for travel dates
  - Weather-based activity suggestions

- ✅ **User Preferences**
  - Save activity preferences
  - Food and dietary preferences
  - Transportation preferences
  - Schedule preference (relaxed/moderate/packed)

- ✅ **Subscription System**
  - Free trial with limited trips
  - Premium plans with unlimited trips
  - Stripe payment integration

- ✅ **Offline Support**
  - View trips without internet
  - Local data caching
  - Sync when online

- ✅ **Beautiful Modern UI**
  - Turquoise/Teal color theme
  - Smooth animations
  - Intuitive navigation
  - Responsive design

---

## 🏗️ Technical Architecture

### Frontend (Mobile App)

**Framework:** React Native 0.81 with Expo SDK 54

**Key Libraries:**
- `@react-navigation` - Navigation and routing
- `axios` - HTTP client for API calls
- `@react-native-async-storage` - Local storage
- `react-native-maps` - Map integration
- `react-native-screens` - Native screen optimization

**State Management:**
- React Context API for global state
- Local state with React Hooks
- AsyncStorage for persistence

---

### Backend (API Server)

**Framework:** Node.js with Express.js

**Key Libraries:**
- `prisma` - ORM for database access
- `express` - Web framework
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `axios` - External API calls
- `redis` - Caching layer

**Database:**
- PostgreSQL for primary data storage
- Redis for caching and sessions

---

### External Services

- **OpenStreetMap/Nominatim** - Geocoding and place search
- **OpenWeatherMap** - Weather data and forecasts
- **REST Countries API** - Country information
- **Stripe** - Payment processing
- **Ollama/HuggingFace** - AI-powered recommendations (optional)

---

## 📚 Additional Documentation

- 🏗️ [Infrastructure Fixes Applied](./INFRASTRUCTURE_FIXES_APPLIED.md) - Latest infrastructure improvements
- 📖 [Frontend Implementation Summary](./FRONTEND_IMPLEMENTATION_SUMMARY.md) - Complete UI overview
- 🎨 [UI Reference](./UI_REFERENCE.md) - Visual component guide  
- 📁 [Project Structure](./PROJECT_STRUCTURE.md) - Code organization
- 🔐 [Subscription Setup](./backend/SUBSCRIPTION_SETUP.md) - Payment integration
- 🚀 [Deployment Guide](./DEPLOYMENT_SUMMARY.md) - Production deployment
- ⚡ [Performance Optimizations](./mobile/PERFORMANCE_OPTIMIZATIONS.md) - Speed improvements
- 🐳 [Docker Architecture](./DOCKER_ARCHITECTURE.md) - Container setup details

---

## 🚀 Production Deployment

### Deploy Backend to Railway/Render/Heroku

1. **Prepare environment variables:**
   ```env
   DATABASE_URL=<production-postgres-url>
   REDIS_HOST=<production-redis-host>
   JWT_SECRET=<strong-random-secret>
   NODE_ENV=production
   ```

2. **Deploy:**
   ```bash
   # Railway
   railway up
   
   # Or Render (connect GitHub repo)
   # Or Heroku
   git push heroku main
   ```

3. **Run migrations:**
   ```bash
   yarn prisma:migrate
   ```

### Deploy Mobile App

#### iOS App Store

```bash
cd mobile

# Configure app.json with your bundle ID
# Build for TestFlight/App Store
yarn eas build --platform ios --profile production

# Submit to App Store
yarn eas submit --platform ios --latest
```

#### Android Play Store

```bash
cd mobile

# Configure app.json with your package name
# Build for Play Store
yarn eas build --platform android --profile production

# Submit to Play Store
yarn eas submit --platform android --latest
```

See [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) for detailed instructions.

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Setting Up for Development

1. **Fork the repository**
   - Click "Fork" button on GitHub
   - Clone your fork: `git clone <your-fork-url>`

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Add comments for complex logic
   - Keep commits focused and descriptive

4. **Test thoroughly**
   - Test on both iOS and Android
   - Ensure backend tests pass
   - Check for console errors

5. **Submit a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create PR on GitHub
   - Describe your changes clearly
   - Link related issues

### Code Style Guidelines

**TypeScript:**
- Use TypeScript for all new files
- Define interfaces for props and data
- Avoid `any` types when possible

**React Native:**
- Use functional components with hooks
- Extract reusable components
- Follow theme system for colors/spacing
- Use StyleSheet.create for styles

**Backend:**
- Use async/await for asynchronous code
- Add error handling for all API calls
- Document complex business logic
- Follow REST API conventions

---

## 🐛 Reporting Issues

Found a bug? Please create an issue with:

1. **Clear title** - Describe the problem briefly
2. **Steps to reproduce** - What did you do?
3. **Expected behavior** - What should happen?
4. **Actual behavior** - What actually happened?
5. **Screenshots** - If applicable
6. **Environment:**
   - OS (iOS/Android/macOS/Windows)
   - App version
   - Device/simulator

**Example:**
```markdown
## Bug: Login button doesn't respond on Android

### Steps to Reproduce
1. Open app on Android emulator
2. Enter email and password
3. Tap "Sign In" button

### Expected
User should be logged in and navigate to Explore screen

### Actual
Button doesn't respond, no error shown

### Environment
- Android 13 emulator
- React Native 0.81.5
- App version 1.0.0
```

---

## 📄 License

ISC License - See [LICENSE](./LICENSE) file for details

---

## 🙏 Acknowledgments

- **Expo Team** - For the amazing React Native framework
- **Prisma** - For the excellent ORM
- **OpenStreetMap** - For free mapping data
- **React Navigation** - For smooth navigation
- **All open-source contributors** - Thank you! 🎉

---

## 📞 Support & Community

- 💬 **Questions?** Create a discussion on GitHub
- 🐛 **Found a bug?** Open an issue
- 💡 **Feature idea?** Start a discussion
- 📧 **Email:** support@traveljoy.app (if applicable)

---

## 🗺️ Roadmap

### Coming Soon
- [ ] Social features (share trips with friends)
- [ ] Collaborative trip planning
- [ ] Trip recommendations based on history
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Push notifications for trip reminders
- [ ] Integration with booking platforms
- [ ] AR features for destination exploration

### In Progress
- [x] Core trip planning features
- [x] User authentication
- [x] Payment integration
- [x] Weather integration

---

**Built with ❤️ using React Native, Node.js, and AI**

*Last updated: December 23, 2025*

---

## 📦 Package Management

This project uses **Yarn** exclusively for consistent dependency management across all environments.

**Why Yarn?**
- ✅ Faster and more reliable than npm
- ✅ Deterministic dependency resolution
- ✅ Better caching and offline support
- ✅ Consistent lock file format

**Important:** Never use `npm install` in this project. Always use `yarn install` or `yarn add <package>`.

If you accidentally create a `package-lock.json` file, delete it immediately and run `yarn install`.

---

### Quick Links

- 🚀 [How to Run the App](#-how-to-run-the-app)
- 🔄 [How to Update the App](#-how-to-update-the-app)
- 📖 [Additional Documentation](#-additional-documentation)
- 💻 [Development Commands](#-development-commands-reference)
- 🧪 [Testing](#-testing-the-app)
- 🐛 [Troubleshooting](#-troubleshooting-common-issues)
