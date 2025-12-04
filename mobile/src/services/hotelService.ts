import api from "./api";

export interface Hotel {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  city: string;
  country: string;
  rating: number;
  price: number;
  imageUrl?: string;
  destination?: string;
}

interface HotelSearchResponse {
  success: boolean;
  data: Hotel[];
  count: number;
}

class HotelService {
  /**
   * Search for hotels in a location
   */
  async searchHotels(location: string, limit: number = 20): Promise<Hotel[]> {
    try {
      const response = await api.get<HotelSearchResponse>("/hotels/search", {
        params: { location, limit },
      });
      return response.data.data;
    } catch (error) {
      console.error("Hotel search error:", error);
      throw error;
    }
  }

  /**
   * Get popular hotels
   */
  async getPopularHotels(): Promise<Hotel[]> {
    try {
      const response = await api.get<HotelSearchResponse>("/hotels/popular");
      return response.data.data;
    } catch (error) {
      console.error("Popular hotels error:", error);
      throw error;
    }
  }
}

export const hotelService = new HotelService();

