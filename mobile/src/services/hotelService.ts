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
      const response = await api.get<HotelSearchResponse>("/api/hotels/search", {
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
      // Use a shorter timeout for hotels since it's optional and we have fallback data
      const response = await api.get<HotelSearchResponse>("/api/hotels/popular", {
        timeout: 10000, // 10 seconds timeout instead of default 30
      });
      return response.data.data;
    } catch (error: any) {
      // Hotel endpoint may not be available - silently return sample data
      // This is expected behavior as hotels is optional
      // Only log if it's not a 404 (expected) or network error
      if (error?.response?.status !== 404 && error?.response?.status !== 500) {
        console.warn("Hotel service unavailable:", error?.message);
      }
      // Return sample data as fallback (includes Lebanon and many other countries)
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
      
      // More Europe Hotels
      { id: '41', name: 'The Ritz Paris', address: '15 Place Vendôme', city: 'Paris', country: 'France', rating: 4.9, price: 650, location: { latitude: 48.8698, longitude: 2.3296 }, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
      { id: '42', name: 'Four Seasons Hotel George V', address: '31 Avenue George V', city: 'Paris', country: 'France', rating: 4.9, price: 720, location: { latitude: 48.8698, longitude: 2.3017 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '43', name: 'The Savoy', address: 'Strand', city: 'London', country: 'England', rating: 4.9, price: 580, location: { latitude: 51.5103, longitude: -0.1200 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '44', name: 'The Langham London', address: '1C Portland Place', city: 'London', country: 'England', rating: 4.8, price: 520, location: { latitude: 51.5194, longitude: -0.1425 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '45', name: 'Hotel Hassler Roma', address: 'Piazza Trinità dei Monti 6', city: 'Rome', country: 'Italy', rating: 4.9, price: 680, location: { latitude: 41.9056, longitude: 12.4832 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '46', name: 'Hotel de Russie', address: 'Via del Babuino 9', city: 'Rome', country: 'Italy', rating: 4.8, price: 590, location: { latitude: 41.9072, longitude: 12.4790 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '47', name: 'Hotel Arts Barcelona', address: 'Carrer de la Marina 19-21', city: 'Barcelona', country: 'Spain', rating: 4.8, price: 380, location: { latitude: 41.3888, longitude: 2.1970 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '48', name: 'Mandarin Oriental Barcelona', address: 'Passeig de Gràcia 38-40', city: 'Barcelona', country: 'Spain', rating: 4.9, price: 420, location: { latitude: 41.3917, longitude: 2.1649 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '49', name: 'The Dylan Amsterdam', address: 'Keizersgracht 384', city: 'Amsterdam', country: 'Netherlands', rating: 4.7, price: 320, location: { latitude: 52.3676, longitude: 4.8841 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '50', name: 'Waldorf Astoria Amsterdam', address: 'Herengracht 542-556', city: 'Amsterdam', country: 'Netherlands', rating: 4.9, price: 450, location: { latitude: 52.3702, longitude: 4.8952 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '51', name: 'Hotel Adlon Kempinski', address: 'Unter den Linden 77', city: 'Berlin', country: 'Germany', rating: 4.8, price: 380, location: { latitude: 52.5163, longitude: 13.3777 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '52', name: 'The Ritz-Carlton Berlin', address: 'Potsdamer Platz 3', city: 'Berlin', country: 'Germany', rating: 4.8, price: 360, location: { latitude: 52.5096, longitude: 13.3766 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '53', name: 'Four Seasons Hotel Prague', address: 'Veleslavínova 2a', city: 'Prague', country: 'Czech Republic', rating: 4.9, price: 340, location: { latitude: 50.0875, longitude: 14.4214 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '54', name: 'Hotel Sacher Wien', address: 'Philharmonikerstrasse 4', city: 'Vienna', country: 'Austria', rating: 4.9, price: 420, location: { latitude: 48.2048, longitude: 16.3731 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '55', name: 'Grand Hotel Europe', address: 'Mikhailovskaya Street 1/7', city: 'St. Petersburg', country: 'Russia', rating: 4.8, price: 280, location: { latitude: 59.9343, longitude: 30.3351 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '56', name: 'Swissôtel The Bosphorus', address: 'Vişnezade Mahallesi, Acısu Sk. No:19', city: 'Istanbul', country: 'Turkey', rating: 4.8, price: 290, location: { latitude: 41.0439, longitude: 29.0082 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '57', name: 'Four Seasons Hotel Istanbul', address: 'Tevkifhane Sk. No:1', city: 'Istanbul', country: 'Turkey', rating: 4.9, price: 380, location: { latitude: 41.0082, longitude: 28.9784 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '58', name: 'The Ritz Lisbon', address: 'Rua Rodrigo da Fonseca 88', city: 'Lisbon', country: 'Portugal', rating: 4.8, price: 320, location: { latitude: 38.7223, longitude: -9.1500 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '59', name: 'The Shelbourne Dublin', address: '27 St Stephen\'s Green', city: 'Dublin', country: 'Ireland', rating: 4.8, price: 340, location: { latitude: 53.3398, longitude: -6.2603 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '60', name: 'Grand Hotel Stockholm', address: 'Södra Blasieholmshamnen 8', city: 'Stockholm', country: 'Sweden', rating: 4.8, price: 360, location: { latitude: 59.3293, longitude: 18.0686 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '61', name: 'Hotel d\'Angleterre', address: 'Kongens Nytorv 34', city: 'Copenhagen', country: 'Denmark', rating: 4.9, price: 420, location: { latitude: 55.6804, longitude: 12.5845 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '62', name: 'The Balmoral Edinburgh', address: '1 Princes Street', city: 'Edinburgh', country: 'Scotland', rating: 4.8, price: 380, location: { latitude: 55.9533, longitude: -3.1883 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '63', name: 'Grand Hotel des Bains', address: 'Avenue des Bains', city: 'St. Moritz', country: 'Switzerland', rating: 4.9, price: 680, location: { latitude: 46.4907, longitude: 9.8355 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '64', name: 'Hotel Metropole Brussels', address: 'Place de Brouckère 31', city: 'Brussels', country: 'Belgium', rating: 4.7, price: 280, location: { latitude: 50.8503, longitude: 4.3517 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      
      // More Asia Hotels
      { id: '65', name: 'The Ritz-Carlton Tokyo', address: '9-7-1 Akasaka', city: 'Tokyo', country: 'Japan', rating: 4.9, price: 580, location: { latitude: 35.6762, longitude: 139.7314 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '66', name: 'Park Hyatt Tokyo', address: '3-7-1-2 Nishi-Shinjuku', city: 'Tokyo', country: 'Japan', rating: 4.9, price: 620, location: { latitude: 35.6852, longitude: 139.6917 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '67', name: 'Mandarin Oriental Tokyo', address: '2-1-1 Nihonbashi Muromachi', city: 'Tokyo', country: 'Japan', rating: 4.9, price: 650, location: { latitude: 35.6869, longitude: 139.7746 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '68', name: 'The Peninsula Bangkok', address: '333 Charoennakorn Road', city: 'Bangkok', country: 'Thailand', rating: 4.9, price: 320, location: { latitude: 13.7246, longitude: 100.4930 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '69', name: 'Mandarin Oriental Bangkok', address: '48 Oriental Avenue', city: 'Bangkok', country: 'Thailand', rating: 4.9, price: 380, location: { latitude: 13.7246, longitude: 100.5150 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '70', name: 'Marina Bay Sands', address: '10 Bayfront Avenue', city: 'Singapore', country: 'Singapore', rating: 4.8, price: 480, location: { latitude: 1.2837, longitude: 103.8607 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '71', name: 'The Ritz-Carlton Singapore', address: '7 Raffles Avenue', city: 'Singapore', country: 'Singapore', rating: 4.9, price: 520, location: { latitude: 1.2897, longitude: 103.8501 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '72', name: 'The Shilla Seoul', address: '249 Dongho-ro', city: 'Seoul', country: 'South Korea', rating: 4.9, price: 420, location: { latitude: 37.5665, longitude: 127.0040 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '73', name: 'Four Seasons Hotel Seoul', address: '97 Saemunan-ro', city: 'Seoul', country: 'South Korea', rating: 4.9, price: 450, location: { latitude: 37.5665, longitude: 126.9780 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '74', name: 'The Peninsula Hong Kong', address: 'Salisbury Road', city: 'Hong Kong', country: 'Hong Kong', rating: 4.9, price: 580, location: { latitude: 22.2950, longitude: 114.1718 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '75', name: 'The Ritz-Carlton Hong Kong', address: 'International Commerce Centre', city: 'Hong Kong', country: 'Hong Kong', rating: 4.9, price: 620, location: { latitude: 22.3047, longitude: 114.1607 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '76', name: 'The St. Regis Bali Resort', address: 'Strand Beach', city: 'Bali', country: 'Indonesia', rating: 4.9, price: 480, location: { latitude: -8.3405, longitude: 115.0920 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '77', name: 'Four Seasons Resort Bali', address: 'Sayan, Ubud', city: 'Bali', country: 'Indonesia', rating: 4.9, price: 520, location: { latitude: -8.5069, longitude: 115.2625 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '78', name: 'The Taj Mahal Palace', address: 'Apollo Bunder', city: 'Mumbai', country: 'India', rating: 4.9, price: 320, location: { latitude: 18.9217, longitude: 72.8332 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '79', name: 'The Oberoi New Delhi', address: 'Dr. Zakir Hussain Marg', city: 'New Delhi', country: 'India', rating: 4.8, price: 280, location: { latitude: 28.6139, longitude: 77.2090 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '80', name: 'The Ritz-Carlton Beijing', address: '83A Jianguo Road', city: 'Beijing', country: 'China', rating: 4.9, price: 420, location: { latitude: 39.9042, longitude: 116.4074 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '81', name: 'The Peninsula Beijing', address: '8 Jinyu Hutong', city: 'Beijing', country: 'China', rating: 4.9, price: 480, location: { latitude: 39.9042, longitude: 116.4074 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '82', name: 'Mandarin Oriental Taipei', address: '158 Dunhua North Road', city: 'Taipei', country: 'Taiwan', rating: 4.8, price: 380, location: { latitude: 25.0330, longitude: 121.5654 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '83', name: 'The Ritz-Carlton Kuala Lumpur', address: '168 Jalan Imbi', city: 'Kuala Lumpur', country: 'Malaysia', rating: 4.9, price: 320, location: { latitude: 3.1390, longitude: 101.6869 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '84', name: 'The Fullerton Hotel Singapore', address: '1 Fullerton Square', city: 'Singapore', country: 'Singapore', rating: 4.8, price: 450, location: { latitude: 1.2867, longitude: 103.8545 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '85', name: 'The Manila Hotel', address: '1 Rizal Park', city: 'Manila', country: 'Philippines', rating: 4.7, price: 180, location: { latitude: 14.5995, longitude: 120.9842 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '86', name: 'Park Hyatt Saigon', address: '2 Lam Son Square', city: 'Ho Chi Minh City', country: 'Vietnam', rating: 4.8, price: 240, location: { latitude: 10.7769, longitude: 106.7009 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      
      // More Americas Hotels
      { id: '87', name: 'The Plaza New York', address: '768 Fifth Avenue', city: 'New York', country: 'USA', rating: 4.9, price: 680, location: { latitude: 40.7648, longitude: -73.9748 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '88', name: 'The St. Regis New York', address: '2 East 55th Street', city: 'New York', country: 'USA', rating: 4.9, price: 720, location: { latitude: 40.7614, longitude: -73.9776 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '89', name: 'Four Seasons Hotel New York', address: '57 East 57th Street', city: 'New York', country: 'USA', rating: 4.9, price: 750, location: { latitude: 40.7614, longitude: -73.9712 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '90', name: 'The Beverly Hills Hotel', address: '9641 Sunset Boulevard', city: 'Los Angeles', country: 'USA', rating: 4.9, price: 680, location: { latitude: 34.0736, longitude: -118.4004 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '91', name: 'The Ritz-Carlton Los Angeles', address: '900 W Olympic Blvd', city: 'Los Angeles', country: 'USA', rating: 4.8, price: 620, location: { latitude: 34.0522, longitude: -118.2437 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '92', name: 'The Fairmont San Francisco', address: '950 Mason Street', city: 'San Francisco', country: 'USA', rating: 4.8, price: 580, location: { latitude: 37.7925, longitude: -122.4091 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '93', name: 'The Ritz-Carlton San Francisco', address: '600 Stockton Street', city: 'San Francisco', country: 'USA', rating: 4.9, price: 650, location: { latitude: 37.7914, longitude: -122.4086 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '94', name: 'Fontainebleau Miami Beach', address: '4441 Collins Avenue', city: 'Miami', country: 'USA', rating: 4.8, price: 520, location: { latitude: 25.8176, longitude: -80.1218 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '95', name: 'The Setai Miami Beach', address: '2001 Collins Avenue', city: 'Miami', country: 'USA', rating: 4.9, price: 680, location: { latitude: 25.7907, longitude: -80.1300 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '96', name: 'Belmond Copacabana Palace', address: 'Avenida Atlântica 1702', city: 'Rio de Janeiro', country: 'Brazil', rating: 4.9, price: 420, location: { latitude: -22.9734, longitude: -43.1822 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '97', name: 'Fasano Rio de Janeiro', address: 'Avenida Vieira Souto 80', city: 'Rio de Janeiro', country: 'Brazil', rating: 4.8, price: 380, location: { latitude: -22.9712, longitude: -43.1822 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '98', name: 'Alvear Palace Hotel', address: 'Avenida Alvear 1891', city: 'Buenos Aires', country: 'Argentina', rating: 4.9, price: 320, location: { latitude: -34.5889, longitude: -58.3933 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '99', name: 'Four Seasons Hotel Mexico City', address: 'Paseo de la Reforma 500', city: 'Mexico City', country: 'Mexico', rating: 4.8, price: 280, location: { latitude: 19.4326, longitude: -99.1332 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '100', name: 'The Ritz-Carlton Toronto', address: '181 Wellington Street West', city: 'Toronto', country: 'Canada', rating: 4.9, price: 480, location: { latitude: 43.6466, longitude: -79.3868 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '101', name: 'Four Seasons Hotel Vancouver', address: '791 West Georgia Street', city: 'Vancouver', country: 'Canada', rating: 4.8, price: 450, location: { latitude: 49.2827, longitude: -123.1207 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '102', name: 'Belmond Miraflores Park', address: 'Avenida Malecón de la Reserva 1035', city: 'Lima', country: 'Peru', rating: 4.8, price: 240, location: { latitude: -12.0464, longitude: -77.0428 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '103', name: 'The Ritz-Carlton Santiago', address: 'El Alcalde 15', city: 'Santiago', country: 'Chile', rating: 4.8, price: 280, location: { latitude: -33.4489, longitude: -70.6693 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      
      // More Middle East & Africa Hotels
      { id: '104', name: 'Burj Al Arab Jumeirah', address: 'Jumeirah Street', city: 'Dubai', country: 'UAE', rating: 4.9, price: 1200, location: { latitude: 25.1412, longitude: 55.1853 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '105', name: 'Atlantis The Palm', address: 'Crescent Road', city: 'Dubai', country: 'UAE', rating: 4.8, price: 580, location: { latitude: 25.1303, longitude: 55.1173 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '106', name: 'Emirates Palace', address: 'West Corniche Road', city: 'Abu Dhabi', country: 'UAE', rating: 4.9, price: 850, location: { latitude: 24.4612, longitude: 54.3209 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '107', name: 'The Ritz-Carlton Abu Dhabi', address: 'Al Maqta Area', city: 'Abu Dhabi', country: 'UAE', rating: 4.8, price: 480, location: { latitude: 24.4539, longitude: 54.3773 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '108', name: 'The Phoenicia Beirut', address: 'Minet El Hosn', city: 'Beirut', country: 'Lebanon', rating: 4.8, price: 280, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '117', name: 'Le Gray Beirut', address: 'Martyrs\' Square', city: 'Beirut', country: 'Lebanon', rating: 4.9, price: 320, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400' },
      { id: '118', name: 'Four Seasons Hotel Beirut', address: '1418 Professor Wafic Sinno Avenue', city: 'Beirut', country: 'Lebanon', rating: 4.9, price: 380, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '119', name: 'The Grand Meshmosh Hotel', address: 'Achrafieh', city: 'Beirut', country: 'Lebanon', rating: 4.7, price: 240, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '120', name: 'InterContinental Phoenicia Beirut', address: 'Minet El Hosn', city: 'Beirut', country: 'Lebanon', rating: 4.8, price: 300, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '121', name: 'Saifi Suites', address: 'Gemmayze', city: 'Beirut', country: 'Lebanon', rating: 4.6, price: 180, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '122', name: 'Albergo Hotel', address: 'Achrafieh', city: 'Beirut', country: 'Lebanon', rating: 4.7, price: 220, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '123', name: 'Monroe Hotel Beirut', address: 'Hamra', city: 'Beirut', country: 'Lebanon', rating: 4.6, price: 200, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '109', name: 'Four Seasons Hotel Cairo', address: '1089 Corniche El Nil', city: 'Cairo', country: 'Egypt', rating: 4.8, price: 240, location: { latitude: 30.0444, longitude: 31.2357 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '110', name: 'La Mamounia', address: 'Avenue Bab Jdid', city: 'Marrakech', country: 'Morocco', rating: 4.9, price: 420, location: { latitude: 31.6295, longitude: -7.9811 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '111', name: 'The Table Bay Hotel', address: 'Quay 6, V&A Waterfront', city: 'Cape Town', country: 'South Africa', rating: 4.8, price: 280, location: { latitude: -33.9069, longitude: 18.4241 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '112', name: 'The King David Jerusalem', address: '23 King David Street', city: 'Jerusalem', country: 'Israel', rating: 4.8, price: 380, location: { latitude: 31.7683, longitude: 35.2137 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '113', name: 'The Ritz-Carlton Doha', address: 'West Bay Lagoon', city: 'Doha', country: 'Qatar', rating: 4.8, price: 420, location: { latitude: 25.2854, longitude: 51.5310 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      
      // More Oceania Hotels
      { id: '114', name: 'Park Hyatt Sydney', address: '7 Hickson Road', city: 'Sydney', country: 'Australia', rating: 4.9, price: 580, location: { latitude: -33.8587, longitude: 151.2140 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '115', name: 'The Langham Melbourne', address: '1 Southgate Avenue', city: 'Melbourne', country: 'Australia', rating: 4.8, price: 420, location: { latitude: -37.8202, longitude: 144.9631 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '116', name: 'The Langham Auckland', address: '83 Symonds Street', city: 'Auckland', country: 'New Zealand', rating: 4.8, price: 380, location: { latitude: -36.8485, longitude: 174.7633 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      
      // Additional Hotels from Various Countries
      { id: '124', name: 'Le Royal Beirut', address: 'Hamra', city: 'Beirut', country: 'Lebanon', rating: 4.7, price: 260, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '125', name: 'Mövenpick Hotel Beirut', address: 'Raouche', city: 'Beirut', country: 'Lebanon', rating: 4.8, price: 290, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '126', name: 'Radisson Blu Martinez Hotel', address: 'Ain El Mreisseh', city: 'Beirut', country: 'Lebanon', rating: 4.6, price: 210, location: { latitude: 33.8938, longitude: 35.5018 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      
      // More hotels from other countries for better coverage
      { id: '127', name: 'The Savoy London', address: 'Strand', city: 'London', country: 'England', rating: 4.9, price: 580, location: { latitude: 51.5103, longitude: -0.1200 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '128', name: 'Le Meurice Paris', address: '228 Rue de Rivoli', city: 'Paris', country: 'France', rating: 4.9, price: 680, location: { latitude: 48.8656, longitude: 2.3286 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '129', name: 'Hotel Hassler Roma', address: 'Piazza Trinità dei Monti 6', city: 'Rome', country: 'Italy', rating: 4.9, price: 680, location: { latitude: 41.9056, longitude: 12.4832 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '130', name: 'The Ritz-Carlton Tokyo', address: '9-7-1 Akasaka', city: 'Tokyo', country: 'Japan', rating: 4.9, price: 580, location: { latitude: 35.6762, longitude: 139.7314 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '131', name: 'The Plaza New York', address: '768 Fifth Avenue', city: 'New York', country: 'USA', rating: 4.9, price: 680, location: { latitude: 40.7648, longitude: -73.9748 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '132', name: 'Burj Al Arab Jumeirah', address: 'Jumeirah Street', city: 'Dubai', country: 'UAE', rating: 4.9, price: 1200, location: { latitude: 25.1412, longitude: 55.1853 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '133', name: 'Park Hyatt Sydney', address: '7 Hickson Road', city: 'Sydney', country: 'Australia', rating: 4.9, price: 580, location: { latitude: -33.8587, longitude: 151.2140 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '134', name: 'The Peninsula Hong Kong', address: 'Salisbury Road', city: 'Hong Kong', country: 'Hong Kong', rating: 4.9, price: 580, location: { latitude: 22.2950, longitude: 114.1718 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '135', name: 'The St. Regis Singapore', address: '29 Tanglin Road', city: 'Singapore', country: 'Singapore', rating: 4.9, price: 550, location: { latitude: 1.2897, longitude: 103.8501 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '136', name: 'The Ritz-Carlton Istanbul', address: 'Suzer Plaza, Elmadag', city: 'Istanbul', country: 'Turkey', rating: 4.9, price: 420, location: { latitude: 41.0082, longitude: 28.9784 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
      { id: '137', name: 'The Ritz-Carlton Barcelona', address: 'Carrer de la Marina 10', city: 'Barcelona', country: 'Spain', rating: 4.9, price: 480, location: { latitude: 41.3888, longitude: 2.1970 }, imageUrl: 'https://images.unsplash.com/photo-1551882547-27440c8d73c3?w=400' },
      { id: '138', name: 'The Ritz-Carlton Berlin', address: 'Potsdamer Platz 3', city: 'Berlin', country: 'Germany', rating: 4.8, price: 360, location: { latitude: 52.5096, longitude: 13.3766 }, imageUrl: 'https://images.unsplash.com/photo-1596439215739-efd6c0c6e1b5?w=400' },
      { id: '139', name: 'The Ritz-Carlton Vienna', address: 'Schubertring 5-7', city: 'Vienna', country: 'Austria', rating: 4.9, price: 450, location: { latitude: 48.2082, longitude: 16.3738 }, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400' },
      { id: '140', name: 'The Ritz-Carlton Moscow', address: 'Tverskaya Street 3', city: 'Moscow', country: 'Russia', rating: 4.8, price: 380, location: { latitude: 55.7558, longitude: 37.6173 }, imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400' },
    ];
  }
}

export const hotelService = new HotelService();


