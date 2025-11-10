# TravelJoy Project Structure

## Overview

This document describes the complete project structure for the TravelJoy AI Travel Planner application.

## Directory Structure

```
travelJoy/
├── .kiro/                          # Kiro specs and configuration
│   └── specs/
│       └── ai-travel-planner/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
├── mobile/                         # React Native mobile app
│   ├── src/
│   │   ├── screens/               # Screen components
│   │   ├── components/            # Reusable UI components
│   │   ├── services/              # API and external services
│   │   │   └── api.ts            # Axios API client
│   │   ├── navigation/            # Navigation configuration
│   │   ├── types/                 # TypeScript type definitions
│   │   │   └── index.ts          # Shared types
│   │   └── utils/                 # Utility functions
│   ├── assets/                    # Images, fonts, etc.
│   ├── App.tsx                    # Main app component
│   ├── app.json                   # Expo configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                       # Environment variables
│   └── .env.example
│
├── backend/                        # Node.js/Express API server
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   │   ├── database.ts       # Prisma client
│   │   │   └── redis.ts          # Redis client
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic
│   │   ├── models/                # Data models
│   │   ├── routes/                # API routes
│   │   ├── middleware/            # Express middleware
│   │   ├── utils/                 # Utility functions
│   │   └── index.ts              # Server entry point
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── dist/                      # Compiled JavaScript (generated)
│   ├── package.json
│   ├── tsconfig.json
│   ├── nodemon.json
│   ├── prisma.config.ts
│   ├── .env                       # Environment variables
│   └── .env.example
│
├── docker-compose.yml              # Docker services configuration
├── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md           # This file
```

## Key Components

### Mobile App (React Native + Expo)

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation
- **State Management**: React Context (to be implemented)
- **API Client**: Axios with interceptors
- **Storage**: AsyncStorage for local data

### Backend API (Node.js + Express)

- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT tokens
- **Payment**: Stripe integration

### Infrastructure

- **Database**: PostgreSQL 15 (Docker container)
- **Cache**: Redis 7 (Docker container)
- **Development**: Docker Compose for local services

## Environment Setup

### Prerequisites

1. Node.js 18+
2. Docker and Docker Compose
3. Expo CLI (optional, can use npx)

### Quick Start

1. Start infrastructure:

   ```bash
   docker-compose up -d
   ```

2. Setup backend:

   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run dev
   ```

3. Setup mobile:
   ```bash
   cd mobile
   npm install
   npm start
   ```

## Development Workflow

1. **Backend Development**:

   - Make changes in `backend/src/`
   - Server auto-reloads with nodemon
   - API available at `http://localhost:3000`

2. **Mobile Development**:

   - Make changes in `mobile/src/`
   - Expo auto-reloads on save
   - Test on iOS/Android simulators or physical devices

3. **Database Changes**:
   - Update `backend/prisma/schema.prisma`
   - Run `npm run prisma:migrate` to create migration
   - Run `npm run prisma:generate` to update Prisma client

## Next Steps

Refer to `.kiro/specs/ai-travel-planner/tasks.md` for the implementation plan and next tasks to complete.
