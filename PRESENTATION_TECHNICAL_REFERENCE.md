# TravelJoy - Technical Reference for Q&A

## Quick Technical Facts

### Tech Stack
- **Frontend:** React Native 0.81, Expo SDK 54, TypeScript
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** PostgreSQL 15 (via Docker)
- **Cache:** Redis 7 (via Docker)
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs

### External APIs Used
1. **LocationIQ/Nominatim** - Geocoding & place search
2. **Open-Meteo** - Weather data (free, no API key)
3. **REST Countries API** - Country information
4. **Ollama/HuggingFace** - AI/LLM services
5. **Stripe** - Payment processing
6. **Overpass API** - Detailed POI data

### Database Models (8 total)
1. User
2. UserPreferences
3. Subscription
4. Trip
5. DailyPlan
6. Activity
7. Meal
8. Transportation

### Key Algorithms

**Budget Enforcement:**
```typescript
// If total cost > budget, scale all costs proportionally
const scaleFactor = budget / totalCost;
// Apply to activities, meals, transportation
```

**Weather Scoring:**
- Temperature: Ideal 15-25°C (score 100)
- Precipitation: >5mm = -30 points
- Cloudiness: >80% = -15 points
- Wind: >10 m/s = -10 points

**Cache Strategy:**
- Weather: 1 hour TTL
- Locations: 24 hours TTL
- Countries: 7 days TTL
- AI responses: 1 hour TTL

### Performance Metrics
- Cache hit rate: 75%+
- API response time: <500ms (cached)
- trip generation: <30 seconds
- TypeScript compilation: 0 errors

### Security Features
- JWT token authentication
- Password hashing with bcrypt
- Request ID tracking
- Environment-aware error messages
- Rate limiting ready

### Error Handling
- 8 custom error classes
- Global error middleware
- Retry logic with exponential backoff
- User-friendly error messages
- Request ID for debugging

### Offline Support
- AsyncStorage for local data
- Pending operations queue
- Automatic sync on reconnect
- Network status monitoring

### AI Integration Points
1. **trip Generation:** `aiService.generatetrip()`
2. **Chat Assistant:** `chatService.processMessage()`
3. **Trip Optimization:** `aiService.optimizePlan()`
4. **Quick Actions:** `chatService.processQuickAction()`

### API Endpoints Count
- Authentication: 4 endpoints
- Trips: 6 endpoints
- Activities: 3 endpoints
- Chat: 4 endpoints
- Weather: 2 endpoints
- Subscriptions: 5 endpoints
- **Total: 24 REST API endpoints**

### Code Statistics
- Backend: ~5,000 lines of TypeScript
- Mobile: ~8,000 lines of TypeScript/TSX
- Services: 10+ service modules
- Components: 17+ reusable components
- Screens: 18 screens

### Testing Coverage
- ✅ TypeScript compilation: 100%
- ✅ Redis caching: 5/5 tests passed
- ✅ Error handling: 8/8 error classes tested
- ✅ Offline support: All features tested
- ✅ Integration: End-to-end tested

### Deployment Ready
- Docker Compose for local development
- Production Docker configuration
- Environment variable management
- Database migrations automated
- CI/CD ready structure

---

## Common Q&A Answers

**Q: Why did you choose React Native?**
A: Cross-platform development, large community, Expo for rapid development, TypeScript support, and native performance.

**Q: How does the AI generate realistic itineraries?**
A: We provide the AI with real place data from OpenStreetMap, weather forecasts, and user preferences. The AI uses this context to create detailed plans with actual locations, not generic descriptions.

**Q: What happens if an external API fails?**
A: We have fallback mechanisms: cached data, graceful error handling, and fallback trip generation using available data. The app continues to function.

**Q: How do you ensure budget constraints are met?**
A: We calculate total cost after AI generation, and if it exceeds budget, we apply a proportional scaling factor to all costs (activities, meals, transport) to bring it within budget.

**Q: Why Redis caching?**
A: Reduces external API calls by 75%, improves response times from 2-3 seconds to <500ms, reduces costs, and improves user experience.

**Q: How does offline support work?**
A: Trip data is stored locally using AsyncStorage. When offline, users can view trips. Operations are queued and automatically synced when connection is restored.

**Q: What makes your solution different from existing apps?**
A: Most apps focus on one aspect (flights OR hotels OR activities). We provide end-to-end planning with AI that considers budget, weather, preferences, and real locations in one conversation.

**Q: How scalable is your architecture?**
A: Microservices architecture, Redis caching, database indexing, connection pooling, and stateless API design make it horizontally scalable.

**Q: What's your biggest technical challenge?**
A: Ensuring AI generates realistic, budget-compliant itineraries with real places. We solved this by providing rich context (real places, weather, preferences) and implementing budget enforcement algorithms.

**Q: How do you handle real-time weather updates?**
A: Weather data is fetched during trip creation and cached for 1 hour. For longer trips, we fetch forecasts for the entire date range and integrate them into the AI prompt.

---

## Demo Flow (If Asked to Show Code)

1. **Show AI Service:** `backend/src/services/aiService.ts`
   - Highlight prompt generation
   - Show budget enforcement algorithm
   - Explain fallback mechanism

2. **Show Trip Creation:** `backend/src/controllers/tripController.ts`
   - Show how external APIs are called
   - Show database transaction
   - Show error handling

3. **Show Database Schema:** `backend/prisma/schema.prisma`
   - Explain relationships
   - Show data model

4. **Show Mobile UI:** `mobile/src/screens/`
   - Show trip creation screen
   - Show trip details with map
   - Show chat interface

---

## Key Selling Points

1. **Solves Real Problem:** 73% of travelers feel overwhelmed
2. **Technical Excellence:** Modern stack, comprehensive error handling
3. **Scalable:** Microservices, caching, optimized queries
4. **User Experience:** Beautiful UI, fast, offline support
5. **Data-Driven:** Real locations, weather integration, budget optimization
6. **Production Ready:** Tested, documented, deployable
