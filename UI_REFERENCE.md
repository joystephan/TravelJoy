# 🎨 TravelJoy UI Components & Screens Reference

## 🏗️ Architecture Overview

```
TravelJoy Mobile App
│
├── 🎨 Theme System
│   ├── Colors (Turquoise/Teal palette)
│   ├── Typography (Display, Headings, Body text)
│   └── Spacing (Consistent 8px system)
│
├── 🧩 Reusable Components
│   ├── DestinationCard (with image, rating, price)
│   ├── SearchBar (with filter button)
│   ├── CategoryChip (selectable filters)
│   ├── ActivityCard (from existing)
│   ├── WeatherWidget (from existing)
│   └── LoadingSpinner (from existing)
│
├── 📱 Screens
│   ├── ExploreScreen (NEW - Home/Discover)
│   ├── TripCreationScreen (ENHANCED)
│   ├── TripDetailScreen (REDESIGNED)
│   ├── LoginScreen (ENHANCED)
│   ├── RegisterScreen (ENHANCED)
│   ├── TripHistoryScreen (existing)
│   └── ProfileScreen (existing)
│
└── 🧭 Navigation
    ├── Bottom Tabs (Explore, Trips, Profile)
    └── Stack Navigator (Detail screens)
```

## 📱 Screen Layouts

### 1. Explore Screen (Home)

```
┌─────────────────────────┐
│  Hello, User! 👋     👤 │  ← Header with greeting
│  Explore the world       │
│                           │
│  🔍 [Search......]   ⚙️  │  ← Search bar
│                           │
│  🌍 All  🏨 Hotels  ✈️   │  ← Category chips
│                           │
│  Popular Destinations     │  ← Section header
│                           │
│  ┌─────┐  ┌─────┐       │
│  │Paris│  │Tokyo│  ⭐4.8│  ← Destination cards
│  │$150 │  │$200 │       │     (with images)
│  └─────┘  └─────┘       │
│                           │
│  ┌───────────────────┐  │
│  │ ✨ Plan Dream Trip│  │  ← Featured banner
│  └───────────────────┘  │
└─────────────────────────┘
```

### 2. Trip Creation Screen

```
┌─────────────────────────┐
│       ✈️                 │  ← Icon header
│   Plan Your Trip         │
│                           │
│  ┌───────────────────┐  │
│  │ 📍 Where to?      │  │  ← Card layout
│  │ [Paris, France]   │  │
│  └───────────────────┘  │
│                           │
│  ┌───────────────────┐  │
│  │ 💰 Budget         │  │
│  │    $1000          │  │
│  │  [-] ▬▬▬▬ [+]    │  │  ← Visual slider
│  └───────────────────┘  │
│                           │
│  ┌───────────────────┐  │
│  │ 📅 Travel Dates   │  │
│  │ [Start] → [End]   │  │
│  └───────────────────┘  │
│                           │
│  ┌───────────────────┐  │
│  │ 🎯 Activities     │  │
│  │ [🏛️][🏔️][🎭]    │  │  ← Chip selection
│  └───────────────────┘  │
│                           │
│  [Create My Trip ✨]     │  ← Submit button
└─────────────────────────┘
```

### 3. Trip Detail Screen

```
┌─────────────────────────┐
│ ┌─────────────────────┐ │
│ │  ← [Map View]    🌤️│ │  ← Hero with map
│ │                      │ │
│ │  Paris               │ │  ← Gradient overlay
│ │  💰 $1500  📅 5 days│ │
│ └─────────────────────┘ │
│                           │
│  Day 1 | Day 2 | Day 3   │  ← Day selector
│  ─────                    │
│                           │
│  Daily Budget: $295       │  ← Budget banner
│  ▬▬▬▬▬▬▬▬▬ 80%          │
│                           │
│  🎯 Activities            │  ← Activities list
│  ┌───────────────────┐  │
│  │ Eiffel Tower      │  │
│  │ 2 hours · $25     │  │
│  └───────────────────┘  │
│     ⚬───               │  ← Timeline
│  ┌───────────────────┐  │
│  │ Louvre Museum     │  │
│  └───────────────────┘  │
│                           │
│  🍽️ Meals                │  ← Meals section
│  🚗 Transportation        │  ← Transport section
└─────────────────────────┘
```

### 4. Login Screen

```
┌─────────────────────────┐
│                           │
│          ✈️              │  ← Logo
│       TravelJoy           │
│  Your AI Travel Companion │
│                           │
│    Welcome Back!          │
│  Sign in to continue      │
│                           │
│  Email                    │
│  [📧 Enter email...]     │  ← Input fields
│                           │
│  Password                 │
│  [🔒 Enter password] 👁️ │  ← With toggle
│                           │
│       Forgot Password?    │
│                           │
│  [    Sign In    ]        │  ← Primary button
│                           │
│         or                │
│                           │
│  [📱 Google] [📘 Facebook]│  ← Social login
│                           │
│  Don't have an account?   │
│        Sign Up            │
└─────────────────────────┘
```

### 5. Register Screen

```
┌─────────────────────────┐
│          ✈️              │
│    Create Account         │
│  Start your journey       │
│                           │
│  First Name   Last Name   │  ← Name fields
│  [John  ]     [Doe   ]   │
│                           │
│  Email                    │
│  [📧 your@email.com]     │
│                           │
│  Password                 │
│  [🔒 Min. 6 chars...] 👁️│
│                           │
│  Confirm Password         │
│  [🔒 Re-enter...]        │
│                           │
│  ☑ I agree to Terms      │  ← Checkbox
│                           │
│  [  Create Account  ]     │
│                           │
│         or                │
│                           │
│  [📱 Google] [📘 Facebook]│
│                           │
│  Already have an account? │
│        Sign In            │
└─────────────────────────┘
```

## 🎨 Color Usage

```
Primary (#50C9C3)      → Buttons, selected states, accents
Primary Dark (#3DA39E) → Hover states, active buttons
White (#FFFFFF)        → Card backgrounds, text on dark
Background (#F5F7FA)   → Screen backgrounds
Text Primary (#2C3E50) → Main text, headings
Text Secondary (#7F8C8D)→ Subtitles, helper text
```

## 🧩 Component Patterns

### Card Pattern
```
┌─────────────────┐
│ Title     Badge │
│ Description     │
│                 │
│ Details  Action │
└─────────────────┘
```

### Input Pattern
```
Label
[🎯 Input field with icon...]
```

### Button Pattern
```
[  Label with Icon ✨  ]
```

### Chip Pattern
```
[ 🎯 Category ]  [ 🏨 Hotel ]
```

## 📊 Layout Grid

The app uses a consistent spacing system:
- **xs**: 4px  (tight spacing)
- **sm**: 8px  (small gaps)
- **md**: 16px (standard padding)
- **lg**: 24px (section spacing)
- **xl**: 32px (large gaps)
- **xxl**: 48px (hero sections)

## 🎯 Interactive Elements

All interactive elements include:
- ✅ **Visual feedback** (opacity changes)
- ✅ **Loading states** (spinners)
- ✅ **Error states** (validation messages)
- ✅ **Success states** (confirmations)
- ✅ **Disabled states** (reduced opacity)

## 🔄 Navigation Flow

```
Explore Screen
    ↓
Trip Creation Screen
    ↓
Trip Detail Screen
    ↓
Edit Activity Screen
```

```
Profile Tab
    ↓
Settings / Preferences
```

## 📱 Responsive Design

All screens adapt to:
- iPhone (various sizes)
- iPad
- Android phones
- Android tablets

Using flexible layouts and percentage-based widths.

## ✨ Animations

Implemented smooth transitions:
- Screen transitions
- Button press feedback
- Card hover effects
- Loading indicators
- Progress bars

---

**This reference shows the complete UI structure of TravelJoy!** 🎉

