"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const nominatimService_1 = __importDefault(require("./nominatimService"));
const redis_1 = __importDefault(require("../config/redis"));
class HotelService {
    constructor() {
        this.overpassUrl = "https://overpass-api.de/api/interpreter";
        this.cacheExpiry = 86400; // 24 hours
    }
    /**
     * Search for hotels using Overpass API (more detailed than Nominatim)
     */
    async searchHotelsWithOverpass(location, options) {
        try {
            // First, get coordinates of the location
            const locationCoords = await nominatimService_1.default.geocode(location);
            if (!locationCoords) {
                throw new Error("Location not found");
            }
            // Search for hotels in a bounding box around the location
            const bbox = this.calculateBoundingBox(locationCoords.lat, locationCoords.lon, 0.1 // ~11km radius
            );
            const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="hotel"](${bbox.minLat},${bbox.minLon},${bbox.maxLat},${bbox.maxLon});
          way["amenity"="hotel"](${bbox.minLat},${bbox.minLon},${bbox.maxLat},${bbox.maxLon});
          relation["amenity"="hotel"](${bbox.minLat},${bbox.minLon},${bbox.maxLat},${bbox.maxLon});
        );
        out center meta;
      `;
            const response = await axios_1.default.post(this.overpassUrl, overpassQuery, {
                headers: {
                    "Content-Type": "text/plain",
                },
            });
            const elements = response.data.elements || [];
            const hotels = [];
            for (const element of elements.slice(0, options?.limit || 20)) {
                const lat = element.lat || element.center?.lat;
                const lon = element.lon || element.center?.lon;
                if (!lat || !lon)
                    continue;
                // Get address via reverse geocoding
                const place = await nominatimService_1.default.reverseGeocode(lat, lon);
                const hotel = {
                    id: `${element.type}_${element.id}`,
                    name: element.tags?.name || "Hotel",
                    address: place?.displayName || location,
                    location: { latitude: lat, longitude: lon },
                    city: place?.address?.city || place?.address?.state || location,
                    country: place?.address?.country || "",
                    rating: this.extractRating(element.tags),
                    price: this.estimatePrice(element.tags, place?.address?.country),
                    imageUrl: this.getHotelImageUrl(lat, lon, element.tags?.name),
                    stars: this.extractStars(element.tags),
                    website: element.tags?.website,
                    phone: element.tags?.phone,
                    description: element.tags?.description || element.tags?.tourism,
                };
                hotels.push(hotel);
            }
            return hotels;
        }
        catch (error) {
            console.error("Overpass API error:", error);
            // Fallback to Nominatim search
            return this.searchHotelsWithNominatim(location, options);
        }
    }
    /**
     * Fallback: Search hotels using Nominatim with enhanced data extraction
     */
    async searchHotelsWithNominatim(location, options) {
        // Try multiple search queries for better results
        const queries = [
            `hotel ${location}`,
            `accommodation ${location}`,
            `lodging ${location}`,
        ];
        const allPlaces = [];
        for (const query of queries) {
            try {
                const places = await nominatimService_1.default.searchPlaces(query, {
                    limit: Math.ceil((options?.limit || 20) / queries.length),
                    addressDetails: true,
                });
                allPlaces.push(...places);
            }
            catch (error) {
                console.error(`Error searching with query "${query}":`, error);
            }
        }
        // Remove duplicates by placeId
        const uniquePlaces = Array.from(new Map(allPlaces.map((p) => [p.placeId, p])).values());
        // Filter to only include hotels and similar accommodations
        const filteredHotels = uniquePlaces.filter((place) => {
            const nameLower = place.name.toLowerCase();
            const displayLower = place.displayName.toLowerCase();
            const typeLower = (place.type || "").toLowerCase();
            return (typeLower === "hotel" ||
                nameLower.includes("hotel") ||
                displayLower.includes("hotel") ||
                nameLower.includes("inn") ||
                displayLower.includes("inn") ||
                nameLower.includes("resort") ||
                displayLower.includes("resort") ||
                nameLower.includes("lodge") ||
                displayLower.includes("lodge") ||
                nameLower.includes("hostel") ||
                displayLower.includes("hostel"));
        });
        // Limit results
        const limitedHotels = filteredHotels.slice(0, options?.limit || 20);
        // Map to hotel data with enhanced information
        const hotels = [];
        for (const place of limitedHotels) {
            // Try to get more details from place details endpoint
            let placeDetails = null;
            if (place.placeId) {
                try {
                    // Extract OSM type and ID from placeId if possible
                    // Note: Nominatim place_id is not the same as OSM ID, so we'll use what we have
                    placeDetails = place; // Use the place data we already have
                }
                catch (error) {
                    // Continue without additional details
                }
            }
            const hotel = {
                id: place.placeId,
                name: place.name || "Hotel",
                address: place.displayName,
                location: {
                    latitude: place.coordinates.lat,
                    longitude: place.coordinates.lon,
                },
                city: place.address?.city || place.address?.town || place.address?.state || location,
                country: place.address?.country || "",
                rating: this.generateRealisticRating(place.name, place.address?.country),
                price: this.generateRealisticPrice(place.address?.country),
                imageUrl: this.getHotelImageUrl(place.coordinates.lat, place.coordinates.lon, place.name),
            };
            hotels.push(hotel);
        }
        return hotels;
    }
    /**
     * Extract hotel rating from OSM tags
     */
    extractRating(tags) {
        // Try to get rating from OSM tags
        if (tags?.rating) {
            const rating = parseFloat(tags.rating);
            if (!isNaN(rating) && rating >= 0 && rating <= 5) {
                return rating;
            }
        }
        // Generate realistic rating based on hotel name/type
        const name = (tags?.name || "").toLowerCase();
        let baseRating = 3.5;
        if (name.includes("resort") || name.includes("spa")) {
            baseRating = 4.2;
        }
        else if (name.includes("luxury") || name.includes("premium")) {
            baseRating = 4.5;
        }
        else if (name.includes("budget") || name.includes("hostel")) {
            baseRating = 3.2;
        }
        // Add some variation
        return Math.round((baseRating + (Math.random() * 0.6 - 0.3)) * 10) / 10;
    }
    /**
     * Extract star rating from OSM tags
     */
    extractStars(tags) {
        if (tags?.stars) {
            const stars = parseInt(tags.stars);
            if (!isNaN(stars) && stars >= 1 && stars <= 5) {
                return stars;
            }
        }
        return undefined;
    }
    /**
     * Estimate price based on location and hotel type
     */
    estimatePrice(tags, country) {
        const name = (tags?.name || "").toLowerCase();
        let basePrice = 100;
        // Adjust based on country (cost of living)
        if (country) {
            const expensiveCountries = ["Switzerland", "Norway", "Iceland", "Denmark"];
            const moderateCountries = ["USA", "UK", "France", "Germany", "Japan"];
            const affordableCountries = ["Thailand", "Vietnam", "India", "Mexico"];
            if (expensiveCountries.includes(country)) {
                basePrice = 200;
            }
            else if (moderateCountries.includes(country)) {
                basePrice = 120;
            }
            else if (affordableCountries.includes(country)) {
                basePrice = 40;
            }
        }
        // Adjust based on hotel type
        if (name.includes("resort") || name.includes("spa") || name.includes("luxury")) {
            basePrice *= 1.8;
        }
        else if (name.includes("budget") || name.includes("hostel")) {
            basePrice *= 0.5;
        }
        // Add variation
        const variation = basePrice * 0.3;
        return Math.floor(basePrice + (Math.random() * variation * 2 - variation));
    }
    /**
     * Generate realistic rating
     */
    generateRealisticRating(name, country) {
        const nameLower = name.toLowerCase();
        let baseRating = 3.8;
        if (nameLower.includes("resort") || nameLower.includes("spa")) {
            baseRating = 4.3;
        }
        else if (nameLower.includes("luxury") || nameLower.includes("premium")) {
            baseRating = 4.6;
        }
        else if (nameLower.includes("budget") || nameLower.includes("hostel")) {
            baseRating = 3.4;
        }
        return Math.round((baseRating + (Math.random() * 0.5 - 0.25)) * 10) / 10;
    }
    /**
     * Generate realistic price
     */
    generateRealisticPrice(country) {
        let basePrice = 100;
        if (country) {
            const expensiveCountries = ["Switzerland", "Norway", "Iceland", "Denmark"];
            const moderateCountries = ["USA", "UK", "France", "Germany", "Japan"];
            const affordableCountries = ["Thailand", "Vietnam", "India", "Mexico"];
            if (expensiveCountries.includes(country)) {
                basePrice = 220;
            }
            else if (moderateCountries.includes(country)) {
                basePrice = 130;
            }
            else if (affordableCountries.includes(country)) {
                basePrice = 45;
            }
        }
        const variation = basePrice * 0.3;
        return Math.floor(basePrice + (Math.random() * variation * 2 - variation));
    }
    /**
     * Get hotel image URL based on location and name
     */
    getHotelImageUrl(lat, lon, name) {
        // Use Unsplash with location-based search
        // Create a deterministic seed based on coordinates for consistent images
        const seed = Math.floor((lat + lon) * 10000) % 1000;
        // Try to extract location keywords from name for better image matching
        const nameLower = (name || "").toLowerCase();
        let imageQuery = "hotel";
        if (nameLower.includes("resort") || nameLower.includes("spa")) {
            imageQuery = "luxury hotel resort";
        }
        else if (nameLower.includes("budget") || nameLower.includes("hostel")) {
            imageQuery = "budget hotel";
        }
        else if (nameLower.includes("boutique")) {
            imageQuery = "boutique hotel";
        }
        // Use Unsplash API with specific hotel images
        const imageIds = [
            "1566073771259-6a8506099945", // Hotel room
            "1596439215739-efd6c0c6e1b5", // Hotel lobby
            "1571896349842-33c89424de2d", // Hotel exterior
            "1564501049412-61c2a3083791", // Modern hotel
            "1551882547-27440c8d73c3", // Luxury hotel
            "1551882547-27440c8d73c3", // Hotel suite
        ];
        const imageId = imageIds[seed % imageIds.length];
        return `https://images.unsplash.com/photo-${imageId}?w=400&h=300&fit=crop&q=80`;
    }
    /**
     * Calculate bounding box around coordinates
     */
    calculateBoundingBox(lat, lon, radiusDegrees) {
        return {
            minLat: lat - radiusDegrees,
            maxLat: lat + radiusDegrees,
            minLon: lon - radiusDegrees,
            maxLon: lon + radiusDegrees,
        };
    }
    /**
     * Main search method - uses Nominatim (faster and more reliable)
     * Overpass can be enabled for more detailed data but is slower
     */
    async searchHotels(location, options) {
        const cacheKey = `hotels:search:${location}:${options?.limit || 20}`;
        // Check cache
        try {
            const cached = await redis_1.default.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }
        catch (error) {
            console.error("Cache get error:", error);
        }
        try {
            let hotels;
            // Use Overpass if explicitly requested (slower but more detailed)
            if (options?.useOverpass) {
                try {
                    hotels = await this.searchHotelsWithOverpass(location, options);
                }
                catch (error) {
                    console.warn("Overpass failed, falling back to Nominatim:", error);
                    hotels = await this.searchHotelsWithNominatim(location, options);
                }
            }
            else {
                // Use Nominatim by default (faster and more reliable)
                hotels = await this.searchHotelsWithNominatim(location, options);
            }
            // Cache the results
            try {
                await redis_1.default.set(cacheKey, JSON.stringify(hotels), "EX", this.cacheExpiry);
            }
            catch (error) {
                console.error("Cache set error:", error);
            }
            return hotels;
        }
        catch (error) {
            console.error("Hotel search error:", error);
            throw error;
        }
    }
}
exports.default = new HotelService();
