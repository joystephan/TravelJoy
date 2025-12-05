export interface Flight {
  id: string;
  route: string; // e.g., "New York → Paris"
  origin: string;
  destination: string;
  airline: string;
  price: number;
  duration: string; // e.g., "8h 30m"
  departureTime: string; // e.g., "08:00"
  arrivalTime: string; // e.g., "16:30"
  rating: number;
  imageUrl?: string;
  stops: number; // 0 for direct, 1+ for stops
}

class FlightService {
  /**
   * Get popular flights
   * In production, this would come from an API
   */
  async getPopularFlights(): Promise<Flight[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const airplaneImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400';
    
    return [
      // Transatlantic
      { id: '1', route: 'New York → Paris', origin: 'New York', destination: 'Paris', airline: 'Air France', price: 650, duration: '7h 45m', departureTime: '22:30', arrivalTime: '11:15', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      { id: '2', route: 'Paris → New York', origin: 'Paris', destination: 'New York', airline: 'Delta', price: 720, duration: '8h 15m', departureTime: '13:45', arrivalTime: '16:00', rating: 4.5, stops: 0, imageUrl: airplaneImage },
      { id: '3', route: 'London → New York', origin: 'London', destination: 'New York', airline: 'British Airways', price: 680, duration: '7h 30m', departureTime: '10:00', arrivalTime: '13:30', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      { id: '4', route: 'New York → London', origin: 'New York', destination: 'London', airline: 'Virgin Atlantic', price: 700, duration: '7h 20m', departureTime: '20:00', arrivalTime: '08:20', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      { id: '5', route: 'Toronto → London', origin: 'Toronto', destination: 'London', airline: 'Air Canada', price: 750, duration: '7h 45m', departureTime: '18:30', arrivalTime: '06:15', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      
      // Europe-Asia
      { id: '6', route: 'London → Tokyo', origin: 'London', destination: 'Tokyo', airline: 'Japan Airlines', price: 1200, duration: '11h 20m', departureTime: '10:00', arrivalTime: '08:20', rating: 4.8, stops: 0, imageUrl: airplaneImage },
      { id: '7', route: 'Tokyo → London', origin: 'Tokyo', destination: 'London', airline: 'British Airways', price: 1100, duration: '12h 30m', departureTime: '11:30', arrivalTime: '15:00', rating: 4.6, stops: 1, imageUrl: airplaneImage },
      { id: '8', route: 'Paris → Tokyo', origin: 'Paris', destination: 'Tokyo', airline: 'Air France', price: 1150, duration: '11h 45m', departureTime: '12:00', arrivalTime: '07:45', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      { id: '9', route: 'Frankfurt → Singapore', origin: 'Frankfurt', destination: 'Singapore', airline: 'Lufthansa', price: 950, duration: '12h 00m', departureTime: '14:00', arrivalTime: '08:00', rating: 4.8, stops: 0, imageUrl: airplaneImage },
      { id: '10', route: 'Amsterdam → Bangkok', origin: 'Amsterdam', destination: 'Bangkok', airline: 'KLM', price: 850, duration: '11h 30m', departureTime: '13:30', arrivalTime: '06:00', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      
      // Asia-Pacific
      { id: '11', route: 'New York → Tokyo', origin: 'New York', destination: 'Tokyo', airline: 'ANA', price: 1350, duration: '13h 45m', departureTime: '12:00', arrivalTime: '16:45', rating: 4.8, stops: 0, imageUrl: airplaneImage },
      { id: '12', route: 'Los Angeles → Sydney', origin: 'Los Angeles', destination: 'Sydney', airline: 'Qantas', price: 1100, duration: '14h 30m', departureTime: '22:00', arrivalTime: '08:30', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      { id: '13', route: 'Sydney → Los Angeles', origin: 'Sydney', destination: 'Los Angeles', airline: 'United', price: 1150, duration: '13h 20m', departureTime: '10:00', arrivalTime: '06:20', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      { id: '14', route: 'Singapore → Sydney', origin: 'Singapore', destination: 'Sydney', airline: 'Singapore Airlines', price: 650, duration: '7h 30m', departureTime: '08:00', arrivalTime: '18:30', rating: 4.9, stops: 0, imageUrl: airplaneImage },
      { id: '15', route: 'Hong Kong → Sydney', origin: 'Hong Kong', destination: 'Sydney', airline: 'Cathay Pacific', price: 700, duration: '9h 00m', departureTime: '23:00', arrivalTime: '10:00', rating: 4.8, stops: 0, imageUrl: airplaneImage },
      
      // Middle East
      { id: '16', route: 'Dubai → Barcelona', origin: 'Dubai', destination: 'Barcelona', airline: 'Emirates', price: 580, duration: '6h 50m', departureTime: '14:20', arrivalTime: '19:10', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      { id: '17', route: 'London → Dubai', origin: 'London', destination: 'Dubai', airline: 'Emirates', price: 550, duration: '6h 30m', departureTime: '08:20', arrivalTime: '19:50', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      { id: '18', route: 'Dubai → London', origin: 'Dubai', destination: 'London', airline: 'British Airways', price: 560, duration: '7h 00m', departureTime: '02:00', arrivalTime: '06:00', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      { id: '19', route: 'Barcelona → Dubai', origin: 'Barcelona', destination: 'Dubai', airline: 'Qatar Airways', price: 680, duration: '7h 10m', departureTime: '09:15', arrivalTime: '20:25', rating: 4.9, stops: 1, imageUrl: airplaneImage },
      { id: '20', route: 'New York → Dubai', origin: 'New York', destination: 'Dubai', airline: 'Emirates', price: 850, duration: '12h 30m', departureTime: '22:00', arrivalTime: '19:30', rating: 4.8, stops: 0, imageUrl: airplaneImage },
      { id: '21', route: 'Paris → Beirut', origin: 'Paris', destination: 'Beirut', airline: 'Middle East Airlines', price: 420, duration: '4h 15m', departureTime: '14:30', arrivalTime: '20:45', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      { id: '22', route: 'London → Beirut', origin: 'London', destination: 'Beirut', airline: 'British Airways', price: 450, duration: '4h 45m', departureTime: '10:00', arrivalTime: '16:45', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      { id: '23', route: 'Beirut → Dubai', origin: 'Beirut', destination: 'Dubai', airline: 'Emirates', price: 380, duration: '3h 00m', departureTime: '08:00', arrivalTime: '12:00', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      
      // Regional Europe
      { id: '24', route: 'Paris → Rome', origin: 'Paris', destination: 'Rome', airline: 'Alitalia', price: 180, duration: '1h 45m', departureTime: '09:00', arrivalTime: '10:45', rating: 4.5, stops: 0, imageUrl: airplaneImage },
      { id: '25', route: 'London → Barcelona', origin: 'London', destination: 'Barcelona', airline: 'Vueling', price: 120, duration: '2h 15m', departureTime: '14:00', arrivalTime: '16:15', rating: 4.4, stops: 0, imageUrl: airplaneImage },
      { id: '26', route: 'Amsterdam → Paris', origin: 'Amsterdam', destination: 'Paris', airline: 'Air France', price: 150, duration: '1h 20m', departureTime: '10:30', arrivalTime: '11:50', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      { id: '27', route: 'Berlin → Vienna', origin: 'Berlin', destination: 'Vienna', airline: 'Austrian Airlines', price: 140, duration: '1h 30m', departureTime: '08:00', arrivalTime: '09:30', rating: 4.5, stops: 0, imageUrl: airplaneImage },
      
      // Asia Regional
      { id: '28', route: 'Bangkok → Singapore', origin: 'Bangkok', destination: 'Singapore', airline: 'Thai Airways', price: 180, duration: '2h 15m', departureTime: '10:00', arrivalTime: '12:15', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      { id: '29', route: 'Singapore → Hong Kong', origin: 'Singapore', destination: 'Hong Kong', airline: 'Singapore Airlines', price: 250, duration: '3h 30m', departureTime: '08:00', arrivalTime: '11:30', rating: 4.8, stops: 0, imageUrl: airplaneImage },
      { id: '30', route: 'Tokyo → Seoul', origin: 'Tokyo', destination: 'Seoul', airline: 'Korean Air', price: 320, duration: '2h 00m', departureTime: '14:00', arrivalTime: '16:00', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      { id: '31', route: 'Hong Kong → Bangkok', origin: 'Hong Kong', destination: 'Bangkok', airline: 'Cathay Pacific', price: 280, duration: '2h 45m', departureTime: '09:30', arrivalTime: '12:15', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      
      // Americas
      { id: '32', route: 'New York → Los Angeles', origin: 'New York', destination: 'Los Angeles', airline: 'American Airlines', price: 350, duration: '5h 30m', departureTime: '08:00', arrivalTime: '11:30', rating: 4.5, stops: 0, imageUrl: airplaneImage },
      { id: '33', route: 'Los Angeles → New York', origin: 'Los Angeles', destination: 'New York', airline: 'Delta', price: 360, duration: '5h 45m', departureTime: '07:00', arrivalTime: '15:45', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      { id: '34', route: 'New York → Toronto', origin: 'New York', destination: 'Toronto', airline: 'Air Canada', price: 280, duration: '1h 45m', departureTime: '10:00', arrivalTime: '11:45', rating: 4.6, stops: 0, imageUrl: airplaneImage },
      { id: '35', route: 'Miami → Rio de Janeiro', origin: 'Miami', destination: 'Rio de Janeiro', airline: 'LATAM', price: 450, duration: '8h 00m', departureTime: '22:00', arrivalTime: '08:00', rating: 4.7, stops: 0, imageUrl: airplaneImage },
      { id: '36', route: 'Mexico City → New York', origin: 'Mexico City', destination: 'New York', airline: 'Aeroméxico', price: 380, duration: '4h 15m', departureTime: '08:30', arrivalTime: '14:45', rating: 4.5, stops: 0, imageUrl: airplaneImage },
    ];
  }
}

export const flightService = new FlightService();

