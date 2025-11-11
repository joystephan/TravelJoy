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
  private baseUrl = "https://nominatim.openstreetmap.org";
  private userAgent = "TravelJoy/1.0";
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
      // Rate limiting: wait 1 second between requests
      await this.rateLimit();

      const params = {
        q: query,
        format: "json",
        addressdetails: options.addressDetails ? 1 : 0,
        limit: options.limit || 10,
        ...(options.countryCode && { countrycodes: options.countryCode }),
      };

      const response = await axios.get(`${this.baseUrl}/search`, {
        params,
        headers: {
          "User-Agent": this.userAgent,
        },
      });

      const places = this.mapToPlaces(response.data);

      // Cache the results
      await this.saveToCache(cacheKey, places);

      return places;
    } catch (error) {
      console.error("Nominatim search error:", error);
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
      await this.rateLimit();

      const response = await axios.get(`${this.baseUrl}/search`, {
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
    } catch (error) {
      console.error("Nominatim geocode error:", error);
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
      await this.rateLimit();

      const response = await axios.get(`${this.baseUrl}/reverse`, {
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
    } catch (error) {
      console.error("Nominatim reverse geocode error:", error);
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
      await this.rateLimit();

      const response = await axios.get(`${this.baseUrl}/lookup`, {
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
    } catch (error) {
      console.error("Nominatim place details error:", error);
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
   * Rate limiting: Nominatim allows 1 request per second
   */
  private async rateLimit(): Promise<void> {
    const lastRequestKey = "nominatim:lastRequest";
    const lastRequest = await redisClient.get(lastRequestKey);

    if (lastRequest) {
      const timeSinceLastRequest = Date.now() - parseInt(lastRequest);
      if (timeSinceLastRequest < 1000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 - timeSinceLastRequest)
        );
      }
    }

    await redisClient.set(lastRequestKey, Date.now().toString(), "EX", 2);
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
