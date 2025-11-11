# External API Services

This directory contains services for integrating with external APIs for travel data.

## Services

### 1. Nominatim Service (`nominatimService.ts`)

OpenStreetMap/Nominatim integration for place search and geocoding.

**Features:**

- Place search with autocomplete
- Geocoding (address → coordinates)
- Reverse geocoding (coordinates → address)
- Place details lookup
- Rate limiting (1 request/second as per Nominatim policy)
- Redis caching (24-hour expiry)

**Usage:**

```typescript
import nominatimService from "./services/nominatimService";

// Search for places
const places = await nominatimService.searchPlaces("Paris", { limit: 5 });

// Geocode an address
const coords = await nominatimService.geocode("Eiffel Tower, Paris");

// Reverse geocode
const place = await nominatimService.reverseGeocode(48.8584, 2.2945);
```

### 2. Weather Service (`weatherService.ts`)

OpenWeatherMap API integration for weather data and forecasts.

**Features:**

- Current weather data
- 5-day weather forecast
- Weather-based trip optimization
- Weather scoring algorithm for outdoor activities
- Automatic recommendations based on conditions
- Redis caching (1-hour expiry)

**Usage:**

```typescript
import weatherService from "./services/weatherService";

// Get current weather
const current = await weatherService.getCurrentWeather({
  lat: 48.8584,
  lon: 2.2945,
});

// Get forecast
const forecast = await weatherService.getForecast(
  { lat: 48.8584, lon: 2.2945 },
  5
);

// Optimize trip by weather
const optimization = await weatherService.optimizeTripByWeather(
  { lat: 48.8584, lon: 2.2945 },
  new Date("2024-06-01"),
  new Date("2024-06-07")
);
```

### 3. Countries Service (`countriesService.ts`)

REST Countries API integration for country information.

**Features:**

- Country information by code or name
- Currency, timezone, and language data
- Travel advisory generation
- Regional country listings
- Comprehensive travel information
- Redis caching (7-day expiry)

**Usage:**

```typescript
import countriesService from "./services/countriesService";

// Get country by code
const country = await countriesService.getCountryByCode("FR");

// Get travel advisory
const advisory = await countriesService.getTravelAdvisory("FR");

// Get comprehensive travel info
const travelInfo = await countriesService.getTravelInfo("FR");
```

### 4. External API Service (`externalApiService.ts`)

Unified interface combining all external API services.

**Features:**

- Single entry point for all external APIs
- Comprehensive destination information
- Combines place, weather, and country data

**Usage:**

```typescript
import externalApiService from "./services/externalApiService";

// Get complete destination information
const destInfo = await externalApiService.getDestinationInfo("Paris, France");
// Returns: { place, weather, country }
```

## Configuration

Add the following to your `.env` file:

```env
# OpenWeatherMap API (required)
OPENWEATHER_API_KEY=your_api_key_here

# Redis (required for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
```

## API Rate Limits

- **Nominatim**: 1 request/second (enforced by service)
- **OpenWeatherMap Free Tier**: 1,000 calls/day, 60 calls/minute
- **REST Countries**: No rate limits

## Caching Strategy

All services use Redis for caching to minimize API calls:

- Nominatim: 24 hours
- Weather: 1 hour
- Countries: 7 days

## Error Handling

All services include:

- Try-catch error handling
- Graceful degradation with cached data
- Detailed error logging
- User-friendly error messages
