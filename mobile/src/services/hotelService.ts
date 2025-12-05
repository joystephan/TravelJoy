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
   * In production, this would come from an API
   */
  async getPopularHotels(): Promise<Hotel[]> {
    try {
      const response = await api.get<HotelSearchResponse>("/hotels/popular");
      return response.data.data;
    } catch (error: any) {
      // Hotel endpoint may not be available - silently return sample data
      // This is expected behavior as hotels is optional
      // Only log if it's not a 404 (expected) or network error
      if (error?.response?.status !== 404) {
        console.warn("Hotel service unavailable:", error?.message);
      }
      // Return sample data as fallback
      return this.getSampleHotels();
    }
  }

  /**
   * Get sample hotels (fallback when API is unavailable)
   */
  private getSampleHotels(): Hotel[] {
    return [
      // Europe
      { id: '1', name: 'Grand Plaza Hotel', address: '123 Champs-Élysées', city: 'Paris', country: 'France', rating: 4.8, price: 180, location: { latitude: 48.8566, longitude: 2.3522 }, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
      { id: '2', name: 'Thames View Hotel', address: '45 Tower Bridge Road', city: 'London', country: 'England', rating: 4.7, price: 200, location: { latitude: 51.5074, longitude: -0.1278 }, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
      { id: '3', name: 'Colosseum Grand', address: 'Via dei Fori Imperiali 1', city: 'Rome', country: 'Italy', rating: 4.9, price: 190, location: { latitude: 41.9028, longitude: 12.4964 }, imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400' },
      { id: '4', name: 'Gaudi Boutique Hotel', address: '321 La Rambla', city: 'Barcelona', country: 'Spain', rating: 4.8, price: 160, location: { latitude: 41.3851, longitude: 2.1734 }, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400' },
      { id: '5', name: 'Canal View Inn', address: 'Prinsengracht 123', city: 'Amsterdam', country: 'Netherlands', rating: 4.6, price: 150, location: { latitude: 52.3676, longitude: 4.9041 }, imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400' },
      { id: '6', name: 'Brandenburg Suites', address: 'Unter den Linden 1', city: 'Berlin', country: 'Germany', rating: 4.5, price: 140, location: { latitude: 52.5200, longitude: 13.4050 }, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
      { id: '7', name: 'Charles Bridge Hotel', address: 'Karlova 1', city: 'Prague', country: 'Czech Republic', rating: 4.7, price: 120, location: { latitude: 50.0755, longitude: 14.4378 }, imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400' },
      { id: '8', name: 'Vienna Opera House Hotel', address: 'Opernring 2', city: 'Vienna', country: 'Austria', rating: 4.8, price: 170, location: { latitude: 48.2082, longitude: 16.3738 }, imageUrl: 'https://images.unsplash.com/photo-1516550893923-42d28cdd4484?w=400' },
      { id: '9', name: 'Acropolis View', address: 'Dionysiou Areopagitou 15', city: 'Athens', country: 'Greece', rating: 4.6, price: 130, location: { latitude: 37.9838, longitude: 23.7275 }, imageUrl: 'https://images.unsplash.com/photo-1605152276897-4f618f831168?w=400' },
      { id: '10', name: 'Blue Mosque Suites', address: 'Sultan Ahmet Mah', city: 'Istanbul', country: 'Turkey', rating: 4.7, price: 110, location: { latitude: 41.0082, longitude: 28.9784 }, imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400' },
      { id: '11', name: 'Lisbon Oceanfront', address: 'Avenida da Liberdade 1', city: 'Lisbon', country: 'Portugal', rating: 4.8, price: 145, location: { latitude: 38.7223, longitude: -9.1393 }, imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400' },
      { id: '12', name: 'Dublin Castle Hotel', address: 'Dame Street 1', city: 'Dublin', country: 'Ireland', rating: 4.6, price: 155, location: { latitude: 53.3498, longitude: -6.2603 }, imageUrl: 'https://images.unsplash.com/photo-1549918864-48ac978761a0?w=400' },
      
      // Asia
      { id: '13', name: 'Sakura Inn', address: '789 Shibuya Crossing', city: 'Tokyo', country: 'Japan', rating: 4.9, price: 220, location: { latitude: 35.6762, longitude: 139.6503 }, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
      { id: '14', name: 'Temple View Resort', address: 'Khao San Road 123', city: 'Bangkok', country: 'Thailand', rating: 4.8, price: 90, location: { latitude: 13.7563, longitude: 100.5018 }, imageUrl: 'https://images.unsplash.com/photo-1552463579-d33e3e18c4e3?w=400' },
      { id: '15', name: 'Marina Bay Suites', address: 'Marina Bay 1', city: 'Singapore', country: 'Singapore', rating: 4.9, price: 200, location: { latitude: 1.2897, longitude: 103.8501 }, imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400' },
      { id: '16', name: 'Gangnam Grand', address: 'Gangnam-daero 123', city: 'Seoul', country: 'South Korea', rating: 4.7, price: 160, location: { latitude: 37.5665, longitude: 126.9780 }, imageUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400' },
      { id: '17', name: 'Victoria Harbour Hotel', address: 'Central 1', city: 'Hong Kong', country: 'Hong Kong', rating: 4.8, price: 210, location: { latitude: 22.3193, longitude: 114.1694 }, imageUrl: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400' },
      { id: '18', name: 'Bali Beach Resort', address: 'Seminyak Beach', city: 'Bali', country: 'Indonesia', rating: 4.9, price: 100, location: { latitude: -8.3405, longitude: 115.0920 }, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
      { id: '19', name: 'Gateway of India Hotel', address: 'Colaba Causeway', city: 'Mumbai', country: 'India', rating: 4.6, price: 80, location: { latitude: 19.0760, longitude: 72.8777 }, imageUrl: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400' },
      { id: '20', name: 'Forbidden City Inn', address: 'Wangfujing Street', city: 'Beijing', country: 'China', rating: 4.7, price: 140, location: { latitude: 39.9042, longitude: 116.4074 }, imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400' },
      { id: '21', name: 'Taipei 101 Hotel', address: 'Xinyi District', city: 'Taipei', country: 'Taiwan', rating: 4.6, price: 150, location: { latitude: 25.0330, longitude: 121.5654 }, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
      { id: '22', name: 'Petronas Towers View', address: 'KLCC', city: 'Kuala Lumpur', country: 'Malaysia', rating: 4.7, price: 110, location: { latitude: 3.1390, longitude: 101.6869 }, imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400' },
      
      // Americas
      { id: '23', name: 'Manhattan Suites', address: '456 Broadway', city: 'New York', country: 'USA', rating: 4.6, price: 250, location: { latitude: 40.7128, longitude: -74.0060 }, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
      { id: '24', name: 'Hollywood Hills Hotel', address: 'Sunset Boulevard 123', city: 'Los Angeles', country: 'USA', rating: 4.7, price: 230, location: { latitude: 34.0522, longitude: -118.2437 }, imageUrl: 'https://images.unsplash.com/photo-1515895309288-a3815ab7cf81?w=400' },
      { id: '25', name: 'Golden Gate View', address: 'Market Street 1', city: 'San Francisco', country: 'USA', rating: 4.8, price: 240, location: { latitude: 37.7749, longitude: -122.4194 }, imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400' },
      { id: '26', name: 'South Beach Resort', address: 'Ocean Drive 123', city: 'Miami', country: 'USA', rating: 4.6, price: 200, location: { latitude: 25.7617, longitude: -80.1918 }, imageUrl: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=400' },
      { id: '27', name: 'Copacabana Beach Hotel', address: 'Avenida Atlântica', city: 'Rio de Janeiro', country: 'Brazil', rating: 4.8, price: 130, location: { latitude: -22.9068, longitude: -43.1729 }, imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400' },
      { id: '28', name: 'Tango Plaza Hotel', address: 'Avenida 9 de Julio', city: 'Buenos Aires', country: 'Argentina', rating: 4.7, price: 115, location: { latitude: -34.6037, longitude: -58.3816 }, imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400' },
      { id: '29', name: 'Zócalo Grand', address: 'Plaza de la Constitución', city: 'Mexico City', country: 'Mexico', rating: 4.6, price: 105, location: { latitude: 19.4326, longitude: -99.1332 }, imageUrl: 'https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=400' },
      { id: '30', name: 'CN Tower Hotel', address: 'Front Street 1', city: 'Toronto', country: 'Canada', rating: 4.7, price: 180, location: { latitude: 43.6532, longitude: -79.3832 }, imageUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400' },
      { id: '31', name: 'Stanley Park View', address: 'Coal Harbour', city: 'Vancouver', country: 'Canada', rating: 4.8, price: 190, location: { latitude: 49.2827, longitude: -123.1207 }, imageUrl: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=400' },
      
      // Middle East & Africa
      { id: '32', name: 'Burj Al Arab View', address: '1 Jumeirah Beach', city: 'Dubai', country: 'UAE', rating: 4.9, price: 350, location: { latitude: 25.2048, longitude: 55.2708 }, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
      { id: '33', name: 'Sheikh Zayed Grand', address: 'Corniche Road', city: 'Abu Dhabi', country: 'UAE', rating: 4.8, price: 340, location: { latitude: 24.4539, longitude: 54.3773 }, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
      { id: '34', name: 'Corniche Beirut Hotel', address: 'Corniche El Manara', city: 'Beirut', country: 'Lebanon', rating: 4.7, price: 130, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
      { id: '35', name: 'Pyramids View Resort', address: 'Giza Plateau', city: 'Cairo', country: 'Egypt', rating: 4.6, price: 90, location: { latitude: 30.0444, longitude: 31.2357 }, imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=400' },
      { id: '36', name: 'Souk Medina Hotel', address: 'Jemaa el-Fnaa', city: 'Marrakech', country: 'Morocco', rating: 4.7, price: 110, location: { latitude: 31.6295, longitude: -7.9811 }, imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400' },
      { id: '37', name: 'Table Mountain View', address: 'V&A Waterfront', city: 'Cape Town', country: 'South Africa', rating: 4.8, price: 120, location: { latitude: -33.9249, longitude: 18.4241 }, imageUrl: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400' },
      
      // Oceania
      { id: '38', name: 'Opera House Hotel', address: 'Circular Quay', city: 'Sydney', country: 'Australia', rating: 4.8, price: 210, location: { latitude: -33.8688, longitude: 151.2093 }, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
      { id: '39', name: 'Yarra River Suites', address: 'Flinders Street', city: 'Melbourne', country: 'Australia', rating: 4.7, price: 195, location: { latitude: -37.8136, longitude: 144.9631 }, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400' },
      { id: '40', name: 'Sky Tower Hotel', address: 'Queen Street', city: 'Auckland', country: 'New Zealand', rating: 4.8, price: 180, location: { latitude: -36.8485, longitude: 174.7633 }, imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400' },
    ];
  }
}

export const hotelService = new HotelService();


