// Simple geocoding utility using Nominatim (OpenStreetMap)
// This is a free, public API for geocoding addresses to coordinates

interface Coordinates {
  latitude: number;
  longitude: number;
}

// Cache for geocoding results to avoid repeated API calls
const geocodeCache = new Map<string, Coordinates>();

/**
 * Geocode a location name, optionally with a destination context
 * Uses Nominatim (OpenStreetMap) free geocoding service
 * @param locationName - The location name to geocode
 * @param destinationContext - Optional destination context (e.g., "Paris")
 * @param retryWithoutContext - Internal flag to prevent infinite recursion
 */
export async function geocodeDestination(
  locationName: string, 
  destinationContext?: string,
  retryWithoutContext: boolean = false
): Promise<Coordinates | null> {
  if (!locationName || locationName.trim() === '') {
    return null;
  }

  // Clean location name - remove "- Day X" suffix
  const cleanLocationName = locationName.replace(/\s*-\s*Day\s+\d+\s*$/i, '').trim();
  
  // Build search query: include destination context if provided and not retrying
  let searchQuery = cleanLocationName;
  if (destinationContext && destinationContext.trim() !== '' && !retryWithoutContext) {
    // For generic activity names, try a more specific search
    // e.g., "Art Gallery Visit" -> "art gallery, Germany"
    const isGenericActivity = /^(visit|tour|walk|explore|discover|see|experience)/i.test(cleanLocationName) ||
                              /\b(visit|tour|walk|explore|discover|see|experience)\b/i.test(cleanLocationName);
    
    if (isGenericActivity) {
      // Remove generic words and use destination context
      const cleanedName = cleanLocationName
        .replace(/\b(visit|tour|walk|explore|discover|see|experience)\b/gi, '')
        .trim();
      // For generic activities, try multiple search strategies
      if (cleanedName) {
        // Try: "art gallery, Germany"
        searchQuery = `${cleanedName}, ${destinationContext}`;
      } else {
        // If no meaningful name left, just use destination
        searchQuery = `${destinationContext}`;
      }
    } else {
      searchQuery = `${cleanLocationName}, ${destinationContext}`;
    }
  }

  // Check cache first
  const cacheKey = searchQuery.toLowerCase().trim();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  try {
    // Use Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      {
        headers: {
          'User-Agent': 'TravelJoy/1.0', // Required by Nominatim
        },
      }
    );

    if (!response.ok) {
      console.warn(`Geocoding failed for ${searchQuery}: ${response.statusText}`);
      // Only retry once if we haven't already retried
      if (destinationContext && !retryWithoutContext) {
        return geocodeDestination(cleanLocationName, undefined, true);
      }
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn(`No results found for: ${searchQuery}`);
      // If we have a destination context and it's a generic activity, try searching just the destination
      if (destinationContext && !retryWithoutContext) {
        // For generic activities, try searching just the destination first
        const isGenericActivity = /^(visit|tour|walk|explore|discover|see|experience)/i.test(cleanLocationName) ||
                                  /\b(visit|tour|walk|explore|discover|see|experience)\b/i.test(cleanLocationName);
        if (isGenericActivity) {
          // Try geocoding just the destination as fallback
          try {
            const destResult = await geocodeDestination(destinationContext);
            if (destResult) {
              return destResult;
            }
          } catch (error) {
            console.warn('Failed to geocode destination as fallback:', error);
          }
        }
        // Retry without context
        return geocodeDestination(cleanLocationName, undefined, true);
      }
      return null;
    }

    const result = data[0];
    const coordinates: Coordinates = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };

    // Validate coordinates
    if (
      isNaN(coordinates.latitude) ||
      isNaN(coordinates.longitude) ||
      Math.abs(coordinates.latitude) > 90 ||
      Math.abs(coordinates.longitude) > 180
    ) {
      console.warn(`Invalid coordinates for ${searchQuery}:`, coordinates);
      // Only retry once if we haven't already retried
      if (destinationContext && !retryWithoutContext) {
        return geocodeDestination(cleanLocationName, undefined, true);
      }
      return null;
    }

    // Cache the result
    geocodeCache.set(cacheKey, coordinates);

    return coordinates;
  } catch (error) {
    console.error(`Error geocoding ${searchQuery}:`, error);
    // Only retry once if we haven't already retried
    if (destinationContext && !retryWithoutContext) {
      return geocodeDestination(cleanLocationName, undefined, true);
    }
    return null;
  }
}

/**
 * Get default coordinates for common destinations (fallback)
 */
export function getDefaultCoordinatesForDestination(destination: string): Coordinates | null {
  const destinationLower = destination.toLowerCase().trim();
  
  // Common destinations with their coordinates
  const commonDestinations: Record<string, Coordinates> = {
    'paris': { latitude: 48.8566, longitude: 2.3522 },
    'london': { latitude: 51.5074, longitude: -0.1278 },
    'new york': { latitude: 40.7128, longitude: -74.0060 },
    'tokyo': { latitude: 35.6762, longitude: 139.6503 },
    'rome': { latitude: 41.9028, longitude: 12.4964 },
    'barcelona': { latitude: 41.3851, longitude: 2.1734 },
    'amsterdam': { latitude: 52.3676, longitude: 4.9041 },
    'berlin': { latitude: 52.5200, longitude: 13.4050 },
    'dubai': { latitude: 25.2048, longitude: 55.2708 },
    'singapore': { latitude: 1.3521, longitude: 103.8198 },
    'sydney': { latitude: -33.8688, longitude: 151.2093 },
    'los angeles': { latitude: 34.0522, longitude: -118.2437 },
    'san francisco': { latitude: 37.7749, longitude: -122.4194 },
    'toronto': { latitude: 43.6532, longitude: -79.3832 },
    'miami': { latitude: 25.7617, longitude: -80.1918 },
    'germany': { latitude: 51.1638175, longitude: 10.4478313 },
    'france': { latitude: 48.8566, longitude: 2.3522 },
    'spain': { latitude: 40.4168, longitude: -3.7038 },
    'italy': { latitude: 41.9028, longitude: 12.4964 },
    'england': { latitude: 51.5074, longitude: -0.1278 },
    'uk': { latitude: 51.5074, longitude: -0.1278 },
    'united kingdom': { latitude: 51.5074, longitude: -0.1278 },
  };

  // Check if destination matches any common destination
  for (const [key, coords] of Object.entries(commonDestinations)) {
    if (destinationLower.includes(key)) {
      return coords;
    }
  }

  return null;
}

