"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nominatimService_1 = __importDefault(require("./nominatimService"));
const weatherService_1 = __importDefault(require("./weatherService"));
const countriesService_1 = __importDefault(require("./countriesService"));
/**
 * Unified External API Service
 * Provides a single interface for all external API integrations
 */
class ExternalApiService {
    // Nominatim/OpenStreetMap methods
    async searchPlaces(query, options) {
        return nominatimService_1.default.searchPlaces(query, options);
    }
    async geocode(address) {
        return nominatimService_1.default.geocode(address);
    }
    async reverseGeocode(lat, lon) {
        return nominatimService_1.default.reverseGeocode(lat, lon);
    }
    async getPlaceDetails(osmType, osmId) {
        return nominatimService_1.default.getPlaceDetails(osmType, osmId);
    }
    // Weather methods
    async getCurrentWeather(coordinates) {
        return weatherService_1.default.getCurrentWeather(coordinates);
    }
    async getWeatherForecast(coordinates, days) {
        return weatherService_1.default.getForecast(coordinates, days);
    }
    async getWeatherData(coordinates, locationName) {
        return weatherService_1.default.getWeatherData(coordinates, locationName);
    }
    async getWeatherForDateRange(coordinates, startDate, endDate) {
        return weatherService_1.default.getWeatherForDateRange(coordinates, startDate, endDate);
    }
    async optimizeTripByWeather(coordinates, startDate, endDate) {
        return weatherService_1.default.optimizeTripByWeather(coordinates, startDate, endDate);
    }
    // Countries methods
    async getCountryByCode(countryCode) {
        return countriesService_1.default.getCountryByCode(countryCode);
    }
    async getCountryByName(countryName) {
        return countriesService_1.default.getCountryByName(countryName);
    }
    async getCountriesByRegion(region) {
        return countriesService_1.default.getCountriesByRegion(region);
    }
    async getCurrencyInfo(countryCode) {
        return countriesService_1.default.getCurrencyInfo(countryCode);
    }
    async getTimezoneInfo(countryCode) {
        return countriesService_1.default.getTimezoneInfo(countryCode);
    }
    async getTravelAdvisory(countryCode) {
        return countriesService_1.default.getTravelAdvisory(countryCode);
    }
    async getTravelInfo(countryCode) {
        return countriesService_1.default.getTravelInfo(countryCode);
    }
    /**
     * Get comprehensive destination information
     * Combines place search, weather, and country data
     */
    async getDestinationInfo(destinationName) {
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
                }
                catch (error) {
                    console.warn("Could not fetch country info:", error);
                }
            }
            return {
                place,
                weather: weatherData,
                country: countryInfo,
            };
        }
        catch (error) {
            console.error("Error fetching destination info:", error);
            throw error;
        }
    }
}
exports.default = new ExternalApiService();
