import nominatimService from "./nominatimService";
import weatherService from "./weatherService";
import countriesService from "./countriesService";
import hotelService from "./hotelService";

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
   * Uses Overpass API for detailed hotel data, falls back to Nominatim
   */
  async searchHotels(location: string, options?: { limit?: number }) {
    return hotelService.searchHotels(location, options);
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
