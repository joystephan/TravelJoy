import nominatimService from "./nominatimService";
import weatherService from "./weatherService";
import countriesService from "./countriesService";

/**
 * Unified External API Service
 * Provides a single interface for all external API integrations
 */
class ExternalApiService {
  // Nominatim/OpenStreetMap methods
  async searchPlaces(query: string, options?: any) {
    return nominatimService.searchPlaces(query, options);
  }

  async geocode(address: string) {
    return nominatimService.geocode(address);
  }

  async reverseGeocode(lat: number, lon: number) {
    return nominatimService.reverseGeocode(lat, lon);
  }

  async getPlaceDetails(osmType: string, osmId: string) {
    return nominatimService.getPlaceDetails(osmType, osmId);
  }

  // Weather methods
  async getCurrentWeather(coordinates: { lat: number; lon: number }) {
    return weatherService.getCurrentWeather(coordinates);
  }

  async getWeatherForecast(
    coordinates: { lat: number; lon: number },
    days?: number
  ) {
    return weatherService.getForecast(coordinates, days);
  }

  async getWeatherData(
    coordinates: { lat: number; lon: number },
    locationName?: string
  ) {
    return weatherService.getWeatherData(coordinates, locationName);
  }

  async getWeatherForDateRange(
    coordinates: { lat: number; lon: number },
    startDate: Date,
    endDate: Date
  ) {
    return weatherService.getWeatherForDateRange(
      coordinates,
      startDate,
      endDate
    );
  }

  async optimizeTripByWeather(
    coordinates: { lat: number; lon: number },
    startDate: Date,
    endDate: Date
  ) {
    return weatherService.optimizeTripByWeather(
      coordinates,
      startDate,
      endDate
    );
  }

  // Countries methods
  async getCountryByCode(countryCode: string) {
    return countriesService.getCountryByCode(countryCode);
  }

  async getCountryByName(countryName: string) {
    return countriesService.getCountryByName(countryName);
  }

  async getCountriesByRegion(region: string) {
    return countriesService.getCountriesByRegion(region);
  }

  async getCurrencyInfo(countryCode: string) {
    return countriesService.getCurrencyInfo(countryCode);
  }

  async getTimezoneInfo(countryCode: string) {
    return countriesService.getTimezoneInfo(countryCode);
  }

  async getTravelAdvisory(countryCode: string) {
    return countriesService.getTravelAdvisory(countryCode);
  }

  async getTravelInfo(countryCode: string) {
    return countriesService.getTravelInfo(countryCode);
  }

  /**
   * Search for hotels in a location
   */
  async searchHotels(location: string, options?: { limit?: number }) {
    try {
      // Search for hotels in the location
      const query = `hotel ${location}`;
      const hotels = await this.searchPlaces(query, {
        limit: options?.limit || 20,
        addressDetails: true,
      });

      // Filter to only include places that are likely hotels
      const filteredHotels = hotels.filter(
        (place) =>
          place.type === "hotel" ||
          place.name.toLowerCase().includes("hotel") ||
          place.displayName.toLowerCase().includes("hotel")
      );

      // Map to hotel format with additional details
      return filteredHotels.map((place) => ({
        id: place.placeId,
        name: place.name,
        address: place.displayName,
        location: {
          latitude: place.coordinates.lat,
          longitude: place.coordinates.lon,
        },
        city: place.address?.city || place.address?.state || location,
        country: place.address?.country || "",
        rating: Math.random() * 2 + 3.5, // Mock rating (4.0-5.5) - in production, use real data
        price: Math.floor(Math.random() * 200 + 50), // Mock price ($50-$250) - in production, use real data
        imageUrl: `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80`, // Default hotel image
      }));
    } catch (error) {
      console.error("Error searching hotels:", error);
      throw new Error("Failed to search hotels");
    }
  }

  /**
   * Get comprehensive destination information
   * Combines place search, weather, and country data
   */
  async getDestinationInfo(destinationName: string) {
    try {
      // Search for the place
      const places = await this.searchPlaces(destinationName, {
        limit: 1,
        addressDetails: true,
      });

      if (!places || places.length === 0) {
        throw new Error("Destination not found");
      }

      const place = places[0];
      const coordinates = place.coordinates;

      // Get weather data
      const weatherData = await this.getWeatherData(coordinates, place.name);

      // Get country information if available
      let countryInfo = null;
      if (place.address?.country) {
        try {
          countryInfo = await this.getCountryByName(place.address.country);
        } catch (error) {
          console.warn("Could not fetch country info:", error);
        }
      }

      return {
        place,
        weather: weatherData,
        country: countryInfo,
      };
    } catch (error) {
      console.error("Error fetching destination info:", error);
      throw error;
    }
  }
}

export default new ExternalApiService();
