# TravelJoy Integration Guide

## Overview

This guide covers the integration between frontend (React Native mobile app) and backend (Node.js/Express API) services, including testing procedures and deployment verification.

## Architecture Overview

```
┌─────────────────────┐
│  React Native App   │
│  (Mobile Frontend)  │
└──────────┬──────────┘
           │
           │ HTTP/REST API
           │
┌──────────▼──────────┐
│  Express Backend    │
│  (Node.js API)      │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼───┐    ┌───▼────┐
│ PostgreSQL│  │ Redis  │
│ Database  │  │ Cache  │
└───────────┘  └────────┘
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation

### Subscription Endpoints

- `GET /api/subscription/plans` - Get available subscription plans
- `GET /api/subscription/status` - Get user subscription status
- `POST /api/subscription/create` - Create new subscription
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/webhook` - Stripe webhook handler

### Trip Endpoints

- `GET /api/trips` - Get user's trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/generate` - Generate itinerary
- `PUT /api/trips/:id/activities/:activityId` - Update activity

### Chat Endpoints

- `POST /api/chat` - Send chat message to AI assistant

## Environment Configuration

### Backend Environment Variables

Required environment variables for the backend (see `backend/.env.example`):

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/traveljoy?schema=public"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
STRIPE_BASIC_PRICE_ID="price_basic_plan_id"
STRIPE_PREMIUM_PRICE_ID="price_premium_plan_id"

# External APIs
OPENWEATHER_API_KEY="your_openweather_api_key"

# AI Configuration
AI_PROVIDER="ollama"
OLLAMA_URL="http://localhost:11434"
AI_MODEL="llama2"

# Server
PORT=3000
NODE_ENV="development"
```

### Mobile Environment Variables

Required environment variables for the mobile app (see `mobile/.env.example`):

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For production, update to your deployed backend URL:

```env
EXPO_PUBLIC_API_URL=https://api.traveljoy.com
```

## Testing Integration

### Backend Integration Tests

Run the comprehensive integration test suite:

```bash
cd backend
npm run test:integration
```

This will test:

1. Health check endpoint
2. User registration flow
3. User login flow
4. Subscription plan retrieval
5. Subscription status check
6. Trip creation
7. Itinerary generation
8. Trip retrieval
9. Chat assistant functionality

### Frontend Connection Tests

The mobile app includes a connection tester utility that can be used to verify API connectivity:

```typescript
import connectionTester from "./src/utils/connectionTest";

// Run all connection tests
const results = await connectionTester.runAllTests();
const summary = connectionTester.getSummary();

console.log(`Tests: ${summary.passed}/${summary.total} passed`);
console.log(`Success Rate: ${summary.successRate.toFixed(1)}%`);
```

## Complete User Journey Testing

### Manual Testing Steps

1. **User Registration**

   - Open the mobile app
   - Navigate to Register screen
   - Enter email, password, and name
   - Submit registration
   - Verify JWT token is stored
   - Verify redirect to main app

2. **Subscriptlow**

   - Navigate to Subscription screen
   - View available plans (Basic, Premium)
   - Select a plan
   - Enter payment details (use Stripe test card: 4242 4242 4242 4242)
   - Complete payment
   - Verify subscription status updates

3. **Trip Creation**

   - Navigate to Trip Creation screen
   - Enter destination (e.g., "Paris, France")
   - Set budget (e.g., $2000)
   - Select dates (start and end)
   - Choose preferences (activity type, food, transport, schedule)
   - Submit trip creation
   - Verify trip is created

4. **Itinerary Generation**

   - Wait for AI to generate itinerary (may take 30-60 seconds)
   - Verify daily plans are displayed
   - Check activities, meals, and transportation
   - Verify map markers are shown
   - Check weather information

5. **Trip Editing**

   - Select an activity to edit
   - Modify activity details or replace with alternative
   - Save changes
   - Verify updates are reflected

6. **Chat Assistant**

   - Open chat interface
   - Ask a travel-related question
   - Verify AI response is received
   - Test quick actions (e.g., "Add restaurant recommendation")
   - Verify trip updates from chat commands

7. **Offline Functionality**
   - Disable network connection
   - Verify previously loaded trips are accessible
   - Make changes to trip
   - Re-enable network
   - Verify changes sync to backend

## API Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid"
}
```

## Authentication Flow

1. User registers or logs in
2. Backend generates JWT token
3. Mobile app stores token in AsyncStorage
4. All subsequent requests include token in Authorization header:
   ```
   Authorization: Bearer <jwt_token>
   ```
5. Backend validates token on protected routes
6. Token expires after 7 days (configurable)

## Subscription Integration

### Stripe Integration Flow

1. User selects subscription plan
2. Mobile app creates payment intent via backend
3. Stripe payment sheet is displayed
4. User enters payment details
5. Payment is processed by Stripe
6. Webhook notifies backend of successful payment
7. Backend updates user subscription status
8. Mobile app polls for status update
9. User gains access to premium features

### Subscription Gates

The app uses `SubscriptionGate` component to restrict access:

```typescript
<SubscriptionGate requiredPlan="premium">
  <PremiumFeature />
</SubscriptionGate>
```

## Error Handling

### Network Errors

- Automatic retry with exponential backoff
- Offline mode detection
- Cached data fallback
- User-friendly error messages

### API Errors

- 400: Validation errors - Display field-specific messages
- 401: Unauthorized - Redirect to login
- 403: Forbidden - Show subscription upgrade prompt
- 404: Not found - Display "Resource not found" message
- 429: Rate limit - Show "Too many requests" with retry timer
- 500: Server error - Display generic error with retry option

## Performance Considerations

### Backend Optimization

- Redis caching for external API responses (TTL: 1 hour)
- Database connection pooling
- Request rate limiting (100 requests/minute per user)
- Gzip compression for responses

### Mobile Optimization

- Lazy loading of screens
- Image optimization and caching
- Debounced search inputs
- Pagination for trip lists
- Optimistic UI updates

## Security Considerations

### Backend Security

- HTTPS only in production
- JWT token validation on all protected routes
- Password hashing with bcrypt (10 rounds)
- SQL injection prevention via Prisma ORM
- CORS configuration for allowed origins
- Rate limiting to prevent abuse
- Input validation and sanitization

### Mobile Security

- Secure token storage in AsyncStorage
- No sensitive data in logs
- Certificate pinning (production)
- Biometric authentication support
- Automatic token refresh

## Monitoring and Logging

### Backend Logging

- Request/response logging
- Error tracking with stack traces
- Performance metrics (response times)
- External API call tracking

### Mobile Logging

- Error boundary for crash reporting
- Network request logging (development only)
- User action tracking (analytics)
- Performance monitoring

## Troubleshooting

### Common Issues

1. **Cannot connect to backend**

   - Verify backend is running (`npm run dev`)
   - Check `EXPO_PUBLIC_API_URL` in mobile `.env`
   - Ensure no firewall blocking port 3000
   - For physical device, use computer's IP address

2. **Authentication fails**

   - Verify JWT_SECRET is set in backend `.env`
   - Check token expiration settings
   - Clear AsyncStorage and re-login

3. **Subscription webhook not working**

   - Verify Stripe webhook secret is correct
   - Check webhook endpoint is accessible
   - Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/subscription/webhook`

4. **AI generation timeout**

   - Verify Ollama is running (if using local LLM)
   - Check AI_PROVIDER and model configuration
   - Increase timeout in AI service

5. **External API errors**
   - Verify API keys are set correctly
   - Check API rate limits
   - Review Redis cache configuration

## Next Steps

After verifying integration:

1. Complete mobile app deployment preparation (Task 11.2)
2. Set up production backend deployment (Task 11.3)
3. Configure production environment variables
4. Set up monitoring and error tracking
5. Perform load testing
6. Create app store listings
7. Submit for review
