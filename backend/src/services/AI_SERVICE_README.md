# AI Service Documentation

## Overview

The AI service provides intelligent travel planning capabilities using either Ollama (local LLM) or HuggingFace API. It powers itinerary generation, trip optimization, and conversational chat assistance.

## Configuration

Add the following environment variables to your `.env` file:

```env
# AI Provider: 'ollama' or 'huggingface'
AI_PROVIDER=ollama

# Ollama Configuration (for local LLM)
OLLAMA_URL=http://localhost:11434
AI_MODEL=llama2

# HuggingFace Configuration (for cloud API)
HUGGINGFACE_API_KEY=your_api_key_here
AI_MODEL=mistralai/Mistral-7B-Instruct-v0.1
```

## Setting Up Ollama (Recommended for Development)

1. Install Ollama from https://ollama.ai
2. Pull a model: `ollama pull llama2`
3. Start Ollama: `ollama serve`
4. The service will automatically connect to `http://localhost:11434`

## Setting Up HuggingFace (Alternative)

1. Create an account at https://huggingface.co
2. Generate an API token from your account settings
3. Add the token to your `.env` file
4. Choose a model (e.g., `mistralai/Mistral-7B-Instruct-v0.1`)

## API Endpoints

### Trip Management

#### Create Trip

```
POST /api/trips
Authorization: Bearer <token>

{
  "destination": "Paris, France",
  "budget": 2000,
  "startDate": "2024-06-01",
  "endDate": "2024-06-05",
  "preferences": {
    "activityType": ["museums", "restaurants", "sightseeing"],
    "foodPreference": ["local", "vegetarian"],
    "transportPreference": ["walk", "metro"],
    "schedulePreference": "moderate"
  }
}
```

#### Get Trip

```
GET /api/trips/:tripId
Authorization: Bearer <token>
```

#### Get All User Trips

```
GET /api/trips
Authorization: Bearer <token>
```

#### Optimize Trip

```
POST /api/trips/:tripId/optimize
Authorization: Bearer <token>

{
  "budget": 1500,
  "preferences": {
    "schedulePreference": "relaxed"
  }
}
```

#### Update Activity

```
PUT /api/trips/activities/:activityId
Authorization: Bearer <token>

{
  "name": "Updated Activity Name",
  "cost": 25,
  "duration": 120
}
```

#### Delete Activity

```
DELETE /api/trips/activities/:activityId
Authorization: Bearer <token>
```

#### Replace Activity

```
POST /api/trips/activities/:activityId/replace
Authorization: Bearer <token>

{
  "name": "New Activity",
  "description": "Alternative activity",
  "latitude": 48.8566,
  "longitude": 2.3522,
  "duration": 90,
  "cost": 20,
  "category": "museum"
}
```

### Chat Assistant

#### Send Message

```
POST /api/chat/message
Authorization: Bearer <token>

{
  "message": "What's the weather like for my trip?",
  "tripId": "optional-trip-id"
}
```

#### Quick Action

```
POST /api/chat/quick-action
Authorization: Bearer <token>

{
  "action": "weather",
  "tripId": "trip-id"
}
```

Available quick actions:

- `weather` - Get weather forecast
- `budget` - Show budget breakdown
- `optimize` - Optimize itinerary
- `restaurants` - Suggest restaurants
- `activities` - Alternative activities
- `transport` - Transportation options

#### Get Chat History

```
GET /api/chat/history?tripId=optional-trip-id
Authorization: Bearer <token>
```

#### Clear Chat History

```
DELETE /api/chat/history
Authorization: Bearer <token>

{
  "tripId": "optional-trip-id"
}
```

#### Modify Trip Plan

```
POST /api/chat/modify-trip
Authorization: Bearer <token>

{
  "tripId": "trip-id",
  "modification": "Replace the museum visit with a park visit"
}
```

## Features

### 1. AI-Powered Itinerary Generation

The service generates detailed multi-day itineraries including:

- Daily activities with timing and costs
- Meal recommendations (breakfast, lunch, dinner)
- Transportation between locations
- Budget optimization
- Weather consideration
- Opening hours awareness

### 2. Trip Optimization

Optimize existing trips based on:

- Budget constraints
- Weather conditions
- User preferences
- Schedule preferences (relaxed, moderate, packed)

### 3. Conversational Chat Assistant

Context-aware chat that can:

- Answer travel questions
- Provide recommendations
- Modify trip plans through natural language
- Process quick actions
- Maintain conversation history

### 4. Caching

All AI responses are cached in Redis for 1 hour to:

- Reduce API costs
- Improve response times
- Handle rate limits

### 5. Fallback Handling

If AI generation fails, the service provides:

- Basic fallback itineraries
- Error handling with graceful degradation
- Retry logic for transient failures

## Response Formats

### Itinerary Response

```json
{
  "trip": {
    "id": "trip-id",
    "destination": "Paris, France",
    "budget": 2000,
    "startDate": "2024-06-01",
    "endDate": "2024-06-05",
    "status": "completed",
    "dailyPlans": [
      {
        "date": "2024-06-01",
        "estimatedCost": 400,
        "activities": [...],
        "meals": [...],
        "transportations": [...]
      }
    ]
  }
}
```

### Chat Response

```json
{
  "response": "The weather forecast shows sunny conditions...",
  "action": "provide_info",
  "updatedPlan": null
}
```

## Error Handling

All endpoints return errors in this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

Common error codes:

- `VALIDATION_ERROR` - Invalid input
- `TRIP_CREATION_ERROR` - Failed to create trip
- `CHAT_ERROR` - Chat processing failed
- `OPTIMIZATION_ERROR` - Trip optimization failed
- `FORBIDDEN` - Access denied
- `NOT_FOUND` - Resource not found

## Performance Considerations

1. **Async Generation**: Trip itineraries are generated asynchronously
2. **Caching**: AI responses are cached to reduce latency
3. **Timeouts**: 60-second timeout for AI requests
4. **Session Management**: Chat sessions limited to 20 messages
5. **Rate Limiting**: Consider implementing rate limits for production

## Best Practices

1. Always check trip status before displaying to users
2. Handle `generating` status with loading indicators
3. Implement retry logic for failed generations
4. Cache trip data on the client side
5. Use quick actions for common queries
6. Clear chat history periodically to save memory

## Troubleshooting

### Ollama Connection Issues

- Ensure Ollama is running: `ollama serve`
- Check the URL in `.env` matches your Ollama instance
- Verify the model is pulled: `ollama list`

### HuggingFace API Issues

- Verify API key is valid
- Check rate limits on your account
- Ensure model name is correct
- Monitor token usage

### Slow Response Times

- Check Redis connection
- Verify AI provider is responding
- Consider using a faster model
- Implement request queuing

### Memory Issues

- Clear old chat sessions periodically
- Limit conversation history length
- Use pagination for trip lists
- Implement session cleanup
