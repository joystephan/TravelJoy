import axios from "axios";
import redisClient from "../config/redis";

interface Coordinates {
  lat: number;
  lon: number;
}

interface Place {
  placeId: string;
  name: string;
  displayName: string;
  coordinates: Coordinates;
  type: string;
  address?: {
    country?: string;
    city?: string;
    state?: string;
    postcode?: string;
  };
  boundingBox?: number[];
}

interface SearchOptions {
  limit?: number;
  countryCode?: string;
  addressDetails?: boolean;
}

class NominatimService {
  private baseUrl = "https://us1.locationiq.com/v1";
  private apiKey = process.env.LOCATIONIQ_API_KEY || "pk.44c3f34a6e224bb5d8f41044718dc07d";
  private cacheExpiry = 86400; // 24 hours in seconds

  /**
   * Search for places by query string
   */
  async searchPlaces(
    query: string,
    options: SearchOptions = {}
  ): Promise<Place[]> {
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

      const response = await axios.get(`${this.baseUrl}/search.php`, {
        params,
        timeout: 10000,
      });

      const places = this.mapToPlaces(response.data);

      // Cache the results
      await this.saveToCache(cacheKey, places);

      return places;
    } catch (error) {
      console.error("LocationIQ search error:", error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error("LocationIQ API request timed out.");
      }
      throw new Error("Failed to search places");
    }
  }

  /**
   * Geocode: Convert address to coordinates
   */
  async geocode(address: string): Promise<Coordinates | null> {
    const cacheKey = `nominatim:geocode:${address}`;

    // Check cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search.php`, {
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
    } catch (error) {
      console.error("LocationIQ geocode error:", error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error("LocationIQ API request timed out.");
      }
      throw new Error("Failed to geocode address");
    }
  }

  /**
   * Reverse geocode: Convert coordinates to address
   */
  async reverseGeocode(lat: number, lon: number): Promise<Place | null> {
    const cacheKey = `nominatim:reverse:${lat}:${lon}`;

    // Check cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/reverse.php`, {
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
    } catch (error) {
      console.error("LocationIQ reverse geocode error:", error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error("LocationIQ API request timed out.");
      }
      throw new Error("Failed to reverse geocode coordinates");
    }
  }

  /**
   * Get place details by OSM ID
   */
  async getPlaceDetails(osmType: string, osmId: string): Promise<Place | null> {
    const cacheKey = `nominatim:details:${osmType}:${osmId}`;

    // Check cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/lookup.php`, {
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
    } catch (error) {
      console.error("LocationIQ place details error:", error);
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        throw new Error("LocationIQ API request timed out.");
      }
      throw new Error("Failed to get place details");
    }
  }

  /**
   * Map Nominatim response to Place interface
   */
  private mapToPlaces(data: any[]): Place[] {
    return data.map((item) => this.mapToPlace(item));
  }

  private mapToPlace(item: any): Place {
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
            city:
              item.address.city || item.address.town || item.address.village,
            state: item.address.state,
            postcode: item.address.postcode,
          }
        : undefined,
      boundingBox: item.boundingbox
        ? item.boundingbox.map((b: string) => parseFloat(b))
        : undefined,
    };
  }


  /**
   * Search for specific types of places (attractions, restaurants, etc.)
   */
  async searchPlacesByType(
    destination: string,
    type: "tourism" | "amenity",
    subtype?: string,
    limit: number = 20
  ): Promise<Place[]> {
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
      } else if (type === "amenity") {
        // Search for amenities like restaurants, cafes
        query = subtype 
          ? `${subtype} in ${destination}` 
          : `restaurants in ${destination}`;
      }

      const response = await axios.get(`${this.baseUrl}/search.php`, {
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
    } catch (error) {
      console.error(`LocationIQ search by type error (${type}):`, error);
      return []; // Return empty array instead of throwing
    }
  }

  /**
   * Search for tourist attractions in a destination
   */
  async searchAttractions(destination: string, limit: number = 20): Promise<Place[]> {
    const queries = [
      `museums in ${destination}`,
      `tourist attractions in ${destination}`,
      `landmarks in ${destination}`,
      `monuments in ${destination}`,
      `art galleries in ${destination}`,
      `parks in ${destination}`,
    ];

    const allPlaces: Place[] = [];
    const seenNames = new Set<string>();

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
      } catch (error) {
        console.warn(`Failed to search with query "${query}":`, error);
        continue;
      }
    }

    return allPlaces.slice(0, limit);
  }

  /**
   * Search for restaurants in a destination
   */
  async searchRestaurants(destination: string, limit: number = 20): Promise<Place[]> {
    const queries = [
      `restaurants in ${destination}`,
      `cafes in ${destination}`,
      `bistros in ${destination}`,
      `dining in ${destination}`,
    ];

    const allPlaces: Place[] = [];
    const seenNames = new Set<string>();

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
      } catch (error) {
        console.warn(`Failed to search with query "${query}":`, error);
        continue;
      }
    }

    return allPlaces.slice(0, limit);
  }

  /**
   * Cache helper methods
   */
  private async getFromCache(key: string): Promise<any | null> {
    try {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  private async saveToCache(key: string, data: any): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(data), "EX", this.cacheExpiry);
    } catch (error) {
      console.error("Cache save error:", error);
    }
  }
}

export default new NominatimService();
