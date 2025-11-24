# TravelJoy Mobile App - Setup & Testing Guide

## 🎯 Overview

TravelJoy is a beautiful, AI-powered travel planning mobile application built with React Native and Expo. This guide will help you set up and test the app on iOS and Android simulators.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or later)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (macOS only): Xcode from App Store
- **Android Emulator**: Android Studio

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/priscillastephan/Desktop/TravelJoy/mobile
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the mobile directory:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000

# Optional: If you have Google Maps API key
GOOGLE_MAPS_API_KEY=your_key_here
```

### 3. Start the Development Server

```bash
npm start
```

This will open the Expo Dev Tools in your browser.

## 📱 Testing on Simulators

### iOS Simulator (macOS only)

1. **Install Xcode** from the Mac App Store
2. **Open Xcode** and install additional components if prompted
3. **Start the simulator**:
   ```bash
   npm run ios
   ```
   Or press `i` in the Expo Dev Tools

### Android Emulator

1. **Install Android Studio**
2. **Set up an Android Virtual Device (AVD)**:
   - Open Android Studio > Tools > AVD Manager
   - Create a new virtual device (recommended: Pixel 5)
3. **Start the emulator**:
   ```bash
   npm run android
   ```
   Or press `a` in the Expo Dev Tools

### Physical Device

1. **Install Expo Go** app from App Store or Google Play
2. **Scan the QR code** shown in Expo Dev Tools
3. The app will load on your device

## 🎨 New Features Implemented

### 1. **Modern UI Theme**
- Turquoise/Teal primary color scheme inspired by modern travel apps
- Consistent design system with colors, typography, and spacing
- Beautiful shadows and gradients

### 2. **Explore Screen**
- Beautiful destination cards with images and ratings
- Search functionality with filter options
- Category chips for Hotels, Flights, Popular destinations
- Featured banner for quick trip creation

### 3. **Enhanced Trip Creation**
- Modern card-based layout
- Visual budget slider with progress indicator
- Icon-based preference selection
- Improved date pickers with visual arrows
- Beautiful schedule pace selection

### 4. **Redesigned Trip Detail Screen**
- Hero section with map and gradient overlay
- Weather widget integration
- Daily budget tracker with progress bar
- Timeline view for activities
- Enhanced meal and transportation cards

### 5. **Beautiful Auth Screens**
- Modern login screen with social auth options
- Comprehensive registration form
- Password visibility toggle
- Terms and conditions checkbox
- Consistent branding throughout

### 6. **Enhanced Navigation**
- Updated tab bar with better styling
- Shadow effects for depth
- Custom icons and colors
- Smooth transitions

## 🛠️ Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── DestinationCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── CategoryChip.tsx
│   │   └── ...
│   ├── screens/         # App screens
│   │   ├── ExploreScreen.tsx
│   │   ├── TripCreationScreen.tsx
│   │   ├── TripDetailScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── ...
│   ├── navigation/      # Navigation configuration
│   ├── contexts/        # React contexts (Auth, Subscription)
│   ├── services/        # API services
│   ├── theme/           # Design system (colors, typography, spacing)
│   ├── types/           # TypeScript interfaces
│   └── utils/           # Utility functions
├── assets/              # Images and fonts
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## 🎨 Theme Configuration

The app uses a centralized theme system located in `src/theme/`:

- **colors.ts**: Color palette (primary, accent, neutrals)
- **typography.ts**: Text styles (headings, body, captions)
- **spacing.ts**: Spacing, border radius, and shadows

## 🔧 Customization

### Changing Colors

Edit `src/theme/colors.ts`:

```typescript
export const colors = {
  primary: '#50C9C3',  // Main brand color
  primaryDark: '#3DA39E',
  // ... more colors
};
```

### Updating Typography

Edit `src/theme/typography.ts`:

```typescript
export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  // ... more styles
};
```

## 🧪 Testing Checklist

### Authentication Flow
- [ ] Register a new account
- [ ] Login with credentials
- [ ] Forgot password flow
- [ ] Logout functionality

### Explore Screen
- [ ] Search destinations
- [ ] Filter by categories
- [ ] Tap on destination cards
- [ ] Navigate to trip creation

### Trip Creation
- [ ] Enter destination
- [ ] Adjust budget with slider
- [ ] Select dates
- [ ] Choose preferences (activities, food, transport)
- [ ] Select schedule pace
- [ ] Submit form
- [ ] Handle validation errors

### Trip Detail
- [ ] View trip information
- [ ] Switch between days
- [ ] View map markers
- [ ] Check weather widget
- [ ] View activities, meals, transportation
- [ ] Edit activity
- [ ] Delete activity

### Navigation
- [ ] Tab navigation between Explore, Trips, Profile
- [ ] Stack navigation to detail screens
- [ ] Back navigation

## 📝 API Configuration

The app expects a backend API running at `http://localhost:3000` by default. Make sure your backend is running:

```bash
cd /Users/priscillastephan/Desktop/TravelJoy/backend
npm run dev
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill the process on port 19000
lsof -ti:19000 | xargs kill -9
```

### Clear Expo Cache
```bash
expo start -c
```

### iOS Simulator Not Opening
```bash
# Reset simulator
xcrun simctl erase all
```

### Android Emulator Issues
```bash
# Restart adb
adb kill-server
adb start-server
```

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

## 🎉 Next Steps

1. **Run the app** on a simulator
2. **Test all features** using the checklist above
3. **Customize the theme** to match your brand
4. **Add more destinations** in ExploreScreen.tsx
5. **Integrate with your backend** API

## 💡 Tips

- Use **Hot Reload** (`r` in Expo CLI) to see changes instantly
- Check **console logs** for debugging
- Use **React DevTools** for component inspection
- Test on **both iOS and Android** for platform-specific issues

Happy Coding! ✨

