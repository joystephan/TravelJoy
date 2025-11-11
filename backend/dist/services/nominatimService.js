"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const redis_1 = __importDefault(require("../config/redis"));
class NominatimService {
    constructor() {
        this.baseUrl = "https://nominatim.openstreetmap.org";
        this.userAgent = "TravelJoy/1.0";
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
            // Rate limiting: wait 1 second between requests
            await this.rateLimit();
            const params = {
                q: query,
                format: "json",
                addressdetails: options.addressDetails ? 1 : 0,
                limit: options.limit || 10,
                ...(options.countryCode && { countrycodes: options.countryCode }),
            };
            const response = await axios_1.default.get(`${this.baseUrl}/search`, {
                params,
                headers: {
                    "User-Agent": this.userAgent,
                },
            });
            const places = this.mapToPlaces(response.data);
            // Cache the results
            await this.saveToCache(cacheKey, places);
            return places;
        }
        catch (error) {
            console.error("Nominatim search error:", error);
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
            await this.rateLimit();
            const response = await axios_1.default.get(`${this.baseUrl}/search`, {
                params: {
                    q: address,
                    format: "json",
                    limit: 1,
                },
                headers: {
                    "User-Agent": this.userAgent,
                },
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
            console.error("Nominatim geocode error:", error);
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
            await this.rateLimit();
            const response = await axios_1.default.get(`${this.baseUrl}/reverse`, {
                params: {
                    lat,
                    lon,
                    format: "json",
                    addressdetails: 1,
                },
                headers: {
                    "User-Agent": this.userAgent,
                },
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
            console.error("Nominatim reverse geocode error:", error);
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
            await this.rateLimit();
            const response = await axios_1.default.get(`${this.baseUrl}/lookup`, {
                params: {
                    osm_ids: `${osmType[0].toUpperCase()}${osmId}`,
                    format: "json",
                    addressdetails: 1,
                },
                headers: {
                    "User-Agent": this.userAgent,
                },
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
            console.error("Nominatim place details error:", error);
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
     * Rate limiting: Nominatim allows 1 request per second
     */
    async rateLimit() {
        const lastRequestKey = "nominatim:lastRequest";
        const lastRequest = await redis_1.default.get(lastRequestKey);
        if (lastRequest) {
            const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
            if (timeSinceLastRequest < 1000) {
                await new Promise((resolve) => setTimeout(resolve, 1000 - timeSinceLastRequest));
            }
        }
        await redis_1.default.set(lastRequestKey, Date.now().toString(), "EX", 2);
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
