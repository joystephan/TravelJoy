"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const redis_1 = __importDefault(require("../config/redis"));
class NominatimService {
    constructor() {
        this.baseUrl = "https://us1.locationiq.com/v1";
        this.apiKey = process.env.LOCATIONIQ_API_KEY || "pk.44c3f34a6e224bb5d8f41044718dc07d";
        this.cacheExpiry = 86400; // 24 hours in seconds
    }
    /**
     * Search for places by query string
     */
    async searchPlaces(query, options = {}) {
        const cacheKey = `nominatim:search:${query}:${JSON.stringify(options)}`;
        // Check cache first
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const params = {
                q: query,
                key: this.apiKey,
                format: "json",
                addressdetails: options.addressDetails ? 1 : 0,
                limit: options.limit || 10,
                ...(options.countryCode && { countrycodes: options.countryCode }),
            };
            const response = await axios_1.default.get(`${this.baseUrl}/search.php`, {
                params,
                timeout: 10000,
            });
            const places = this.mapToPlaces(response.data);
            // Cache the results
            await this.saveToCache(cacheKey, places);
            return places;
        }
        catch (error) {
            console.error("LocationIQ search error:", error);
            if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
                throw new Error("LocationIQ API request timed out.");
            }
            throw new Error("Failed to search places");
        }
    }
    /**
     * Geocode: Convert address to coordinates
     */
    async geocode(address) {
        const cacheKey = `nominatim:geocode:${address}`;
        // Check cache first
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/search.php`, {
                params: {
                    q: address,
                    key: this.apiKey,
                    format: "json",
                    limit: 1,
                },
                timeout: 10000,
            });
            if (response.data.length === 0) {
                return null;
            }
            const coordinates = {
                lat: parseFloat(response.data[0].lat),
                lon: parseFloat(response.data[0].lon),
            };
            // Cache the result
            await this.saveToCache(cacheKey, coordinates);
            return coordinates;
        }
        catch (error) {
            console.error("LocationIQ geocode error:", error);
            if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
                throw new Error("LocationIQ API request timed out.");
            }
            throw new Error("Failed to geocode address");
        }
    }
    /**
     * Reverse geocode: Convert coordinates to address
     */
    async reverseGeocode(lat, lon) {
        const cacheKey = `nominatim:reverse:${lat}:${lon}`;
        // Check cache first
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/reverse.php`, {
                params: {
                    lat,
                    lon,
                    key: this.apiKey,
                    format: "json",
                    addressdetails: 1,
                },
                timeout: 10000,
            });
            if (!response.data || response.data.error) {
                return null;
            }
            const place = this.mapToPlace(response.data);
            // Cache the result
            await this.saveToCache(cacheKey, place);
            return place;
        }
        catch (error) {
            console.error("LocationIQ reverse geocode error:", error);
            if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
                throw new Error("LocationIQ API request timed out.");
            }
            throw new Error("Failed to reverse geocode coordinates");
        }
    }
    /**
     * Get place details by OSM ID
     */
    async getPlaceDetails(osmType, osmId) {
        const cacheKey = `nominatim:details:${osmType}:${osmId}`;
        // Check cache first
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/lookup.php`, {
                params: {
                    osm_ids: `${osmType[0].toUpperCase()}${osmId}`,
                    key: this.apiKey,
                    format: "json",
                    addressdetails: 1,
                },
                timeout: 10000,
            });
            if (response.data.length === 0) {
                return null;
            }
            const place = this.mapToPlace(response.data[0]);
            // Cache the result
            await this.saveToCache(cacheKey, place);
            return place;
        }
        catch (error) {
            console.error("LocationIQ place details error:", error);
            if (axios_1.default.isAxiosError(error) && error.code === 'ECONNABORTED') {
                throw new Error("LocationIQ API request timed out.");
            }
            throw new Error("Failed to get place details");
        }
    }
    /**
     * Map Nominatim response to Place interface
     */
    mapToPlaces(data) {
        return data.map((item) => this.mapToPlace(item));
    }
    mapToPlace(item) {
        return {
            placeId: item.place_id?.toString() || "",
            name: item.name || item.display_name.split(",")[0],
            displayName: item.display_name,
            coordinates: {
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
            },
            type: item.type || item.class,
            address: item.address
                ? {
                    country: item.address.country,
                    city: item.address.city || item.address.town || item.address.village,
                    state: item.address.state,
                    postcode: item.address.postcode,
                }
                : undefined,
            boundingBox: item.boundingbox
                ? item.boundingbox.map((b) => parseFloat(b))
                : undefined,
        };
    }
    /**
     * Search for specific types of places (attractions, restaurants, etc.)
     */
    async searchPlacesByType(destination, type, subtype, limit = 20) {
        const cacheKey = `nominatim:type:${destination}:${type}:${subtype}:${limit}`;
        // Check cache first
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
            return cached;
        }
        try {
            // Build query based on type
            let query = "";
            if (type === "tourism") {
                // Search for tourist attractions
                query = subtype
                    ? `${subtype} in ${destination}`
                    : `tourist attractions in ${destination}`;
            }
            else if (type === "amenity") {
                // Search for amenities like restaurants, cafes
                query = subtype
                    ? `${subtype} in ${destination}`
                    : `restaurants in ${destination}`;
            }
            const response = await axios_1.default.get(`${this.baseUrl}/search.php`, {
                params: {
                    q: query,
                    key: this.apiKey,
                    format: "json",
                    addressdetails: 1,
                    limit: limit,
                },
                timeout: 10000,
            });
            const places = this.mapToPlaces(response.data);
            // Cache the results
            await this.saveToCache(cacheKey, places);
            return places;
        }
        catch (error) {
            console.error(`LocationIQ search by type error (${type}):`, error);
            return []; // Return empty array instead of throwing
        }
    }
    /**
     * Search for tourist attractions in a destination
     */
    async searchAttractions(destination, limit = 20) {
        const queries = [
            `museums in ${destination}`,
            `tourist attractions in ${destination}`,
            `landmarks in ${destination}`,
            `monuments in ${destination}`,
            `art galleries in ${destination}`,
            `parks in ${destination}`,
        ];
        const allPlaces = [];
        const seenNames = new Set();
        // Try multiple queries to get diverse results
        for (const query of queries) {
            try {
                const places = await this.searchPlaces(query, { limit: 5 });
                for (const place of places) {
                    // Avoid duplicates based on name
                    const normalizedName = place.name.toLowerCase().trim();
                    if (!seenNames.has(normalizedName)) {
                        seenNames.add(normalizedName);
                        allPlaces.push(place);
                    }
                }
                if (allPlaces.length >= limit) {
                    break;
                }
            }
            catch (error) {
                console.warn(`Failed to search with query "${query}":`, error);
                continue;
            }
        }
        return allPlaces.slice(0, limit);
    }
    /**
     * Search for restaurants in a destination
     */
    async searchRestaurants(destination, limit = 20) {
        const queries = [
            `restaurants in ${destination}`,
            `cafes in ${destination}`,
            `bistros in ${destination}`,
            `dining in ${destination}`,
        ];
        const allPlaces = [];
        const seenNames = new Set();
        // Try multiple queries to get diverse results
        for (const query of queries) {
            try {
                const places = await this.searchPlaces(query, { limit: 5 });
                for (const place of places) {
                    // Avoid duplicates based on name
                    const normalizedName = place.name.toLowerCase().trim();
                    if (!seenNames.has(normalizedName)) {
                        seenNames.add(normalizedName);
                        allPlaces.push(place);
                    }
                }
                if (allPlaces.length >= limit) {
                    break;
                }
            }
            catch (error) {
                console.warn(`Failed to search with query "${query}":`, error);
                continue;
            }
        }
        return allPlaces.slice(0, limit);
    }
    /**
     * Cache helper methods
     */
    async getFromCache(key) {
        try {
            const cached = await redis_1.default.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            console.error("Cache get error:", error);
            return null;
        }
    }
    async saveToCache(key, data) {
        try {
            await redis_1.default.set(key, JSON.stringify(data), "EX", this.cacheExpiry);
        }
        catch (error) {
            console.error("Cache save error:", error);
        }
    }
}
exports.default = new NominatimService();
