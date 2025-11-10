# TravelJoy - AI Travel Planner

An intelligent mobile application that simplifies travel planning by using AI to generate personalized multi-day travel schedules.

## Project Structure

```
travelJoy/
├── mobile/              # React Native app with Expo
├── backend/             # Node.js/Express API server
├── docker-compose.yml   # Docker configuration for PostgreSQL and Redis
└── README.md
```

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Expo CLI (installed globally): `npm install -g expo-cli`

## Getting Started

### 1. Start Database Services

Start PostgreSQL and Redis using Docker:

```bash
docker-compose up -d
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3000`

### 3. Setup Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npm start
```

Then:

- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## Environment Variables

### Backend (.env)

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST` and `REDIS_PORT`: Redis configuration
- `JWT_SECRET`: Secret key for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe API key for payments
- `OPENWEATHER_API_KEY`: OpenWeatherMap API key

## Development

### Backend Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

### Mobile Commands

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser

## Tech Stack

### Frontend

- React Native with Expo
- TypeScript
- React Navigation

### Backend

- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis

### External APIs

- OpenStreetMap/Nominatim (Places)
- OpenWeatherMap (Weather)
- REST Countries API (Country info)
- Stripe (Payments)

## License

ISC
