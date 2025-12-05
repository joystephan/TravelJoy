import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';
import SearchBar from '../components/SearchBar';
import CategoryChip from '../components/CategoryChip';
import DestinationCard from '../components/DestinationCard';
import HotelCard from '../components/HotelCard';
import FlightCard from '../components/FlightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import DrawerMenu from '../components/DrawerMenu';
import { hotelService, Hotel } from '../services/hotelService';
import { flightService, Flight } from '../services/flightService';

interface ExploreScreenProps {
  navigation: any;
}

// Sample destination data - in production, this would come from an API
const POPULAR_DESTINATIONS = [
  // Europe
  { id: '1', destination: 'Paris', country: 'France', price: 150, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400' },
  { id: '2', destination: 'London', country: 'England', price: 180, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
  { id: '3', destination: 'Barcelona', country: 'Spain', price: 140, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400' },
  { id: '4', destination: 'Rome', country: 'Italy', price: 160, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400' },
  { id: '5', destination: 'Amsterdam', country: 'Netherlands', price: 130, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400' },
  { id: '6', destination: 'Berlin', country: 'Germany', price: 120, rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  { id: '7', destination: 'Prague', country: 'Czech Republic', price: 100, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400' },
  { id: '8', destination: 'Vienna', country: 'Austria', price: 140, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1516550893923-42d28cdd4484?w=400' },
  { id: '9', destination: 'Athens', country: 'Greece', price: 110, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1605152276897-4f618f831168?w=400' },
  { id: '10', destination: 'Istanbul', country: 'Turkey', price: 90, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400' },
  { id: '11', destination: 'Lisbon', country: 'Portugal', price: 125, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400' },
  { id: '12', destination: 'Dublin', country: 'Ireland', price: 145, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1549918864-48ac978761a0?w=400' },
  { id: '13', destination: 'Stockholm', country: 'Sweden', price: 170, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400' },
  { id: '14', destination: 'Copenhagen', country: 'Denmark', price: 165, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400' },
  { id: '15', destination: 'Edinburgh', country: 'Scotland', price: 150, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  
  // Asia
  { id: '16', destination: 'Tokyo', country: 'Japan', price: 200, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  { id: '17', destination: 'Bangkok', country: 'Thailand', price: 80, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1552463579-d33e3e18c4e3?w=400' },
  { id: '18', destination: 'Singapore', country: 'Singapore', price: 180, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400' },
  { id: '19', destination: 'Seoul', country: 'South Korea', price: 140, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=400' },
  { id: '20', destination: 'Hong Kong', country: 'Hong Kong', price: 190, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400' },
  { id: '21', destination: 'Bali', country: 'Indonesia', price: 70, rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400' },
  { id: '22', destination: 'Mumbai', country: 'India', price: 60, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400' },
  { id: '23', destination: 'Beijing', country: 'China', price: 120, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400' },
  { id: '24', destination: 'Taipei', country: 'Taiwan', price: 130, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  { id: '25', destination: 'Kuala Lumpur', country: 'Malaysia', price: 90, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400' },
  { id: '26', destination: 'Manila', country: 'Philippines', price: 75, rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  { id: '27', destination: 'Ho Chi Minh City', country: 'Vietnam', price: 65, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  
  // Americas
  { id: '28', destination: 'New York', country: 'USA', price: 220, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
  { id: '29', destination: 'Los Angeles', country: 'USA', price: 200, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1515895309288-a3815ab7cf81?w=400' },
  { id: '30', destination: 'San Francisco', country: 'USA', price: 210, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400' },
  { id: '31', destination: 'Miami', country: 'USA', price: 180, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?w=400' },
  { id: '32', destination: 'Rio de Janeiro', country: 'Brazil', price: 110, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400' },
  { id: '33', destination: 'Buenos Aires', country: 'Argentina', price: 95, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400' },
  { id: '34', destination: 'Mexico City', country: 'Mexico', price: 85, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=400' },
  { id: '35', destination: 'Toronto', country: 'Canada', price: 160, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=400' },
  { id: '36', destination: 'Vancouver', country: 'Canada', price: 170, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=400' },
  { id: '37', destination: 'Lima', country: 'Peru', price: 80, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  { id: '38', destination: 'Santiago', country: 'Chile', price: 100, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  
  // Middle East & Africa
  { id: '39', destination: 'Dubai', country: 'UAE', price: 250, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
  { id: '40', destination: 'Abu Dhabi', country: 'UAE', price: 240, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  { id: '41', destination: 'Beirut', country: 'Lebanon', price: 110, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  { id: '42', destination: 'Cairo', country: 'Egypt', price: 70, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=400' },
  { id: '43', destination: 'Marrakech', country: 'Morocco', price: 90, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=400' },
  { id: '44', destination: 'Cape Town', country: 'South Africa', price: 100, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  { id: '45', destination: 'Tel Aviv', country: 'Israel', price: 180, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  { id: '46', destination: 'Doha', country: 'Qatar', price: 200, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
  
  // Oceania
  { id: '47', destination: 'Sydney', country: 'Australia', price: 190, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { id: '48', destination: 'Melbourne', country: 'Australia', price: 175, rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400' },
  { id: '49', destination: 'Auckland', country: 'New Zealand', price: 160, rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1587330979470-3585ac3d45b3?w=400' },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: '🌍' },
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'flights', label: 'Flights', icon: '✈️' },
  { id: 'popular', label: 'Popular', icon: '🔥' },
];

export default function ExploreScreen({ navigation }: ExploreScreenProps) {
  const [userName, setUserName] = useState('Traveler');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'hotels') {
      loadHotels();
      setFlights([]);
    } else if (selectedCategory === 'flights') {
      loadFlights();
      setHotels([]);
    } else {
      setHotels([]);
      setFlights([]);
    }
  }, [selectedCategory]);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setUserName(user.firstName || user.email || 'Traveler');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadHotels = async () => {
    setLoadingHotels(true);
    try {
      const popularHotels = await hotelService.getPopularHotels();
      setHotels(popularHotels);
    } catch (error) {
      console.error('Error loading hotels:', error);
      // On error, set empty array so UI doesn't break
      setHotels([]);
    } finally {
      setLoadingHotels(false);
    }
  };

  const loadFlights = async () => {
    setLoadingFlights(true);
    try {
      const popularFlights = await flightService.getPopularFlights();
      setFlights(popularFlights);
    } catch (error) {
      console.error('Error loading flights:', error);
      // On error, set empty array so UI doesn't break
      setFlights([]);
    } finally {
      setLoadingFlights(false);
    }
  };

  const filteredDestinations = POPULAR_DESTINATIONS.filter((dest) =>
    dest.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Popular destinations (top-rated, rating >= 4.7)
  const popularDestinations = POPULAR_DESTINATIONS.filter((dest) =>
    dest.rating >= 4.7
  ).filter((dest) =>
    dest.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hotel.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFlights = flights.filter((flight) =>
    flight.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flight.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flight.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    flight.airline.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDestinationPress = (destination: any) => {
    navigation.navigate('CreateTrip', { destination: destination.destination });
  };

  const handleHotelPress = (hotel: Hotel) => {
    // Navigate to create trip with hotel location
    navigation.navigate('CreateTrip', { destination: hotel.city || hotel.address });
  };

  const handleFlightPress = (flight: Flight) => {
    // Navigate to create trip with flight destination
    navigation.navigate('CreateTrip', { destination: flight.destination });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
              <Text style={styles.subtitle}>Explore the world</Text>
            </View>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setDrawerVisible(true)}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchBar}
          />
        </View>

        {/* Create Trip Banner - Moved to top */}
        <TouchableOpacity
          style={styles.createTripBanner}
          onPress={() => navigation.navigate('CreateTrip')}
          activeOpacity={0.8}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerEmoji}>✨</Text>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Create My Trip</Text>
              <Text style={styles.bannerSubtitle}>
                Your perfect trip, planned instantly
              </Text>
            </View>
            <Text style={styles.bannerArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <CategoryChip
              key={category.id}
              label={category.label}
              icon={category.icon}
              selected={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>

        {/* Content based on selected category */}
        {selectedCategory === 'hotels' ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hotels</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {loadingHotels ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner size="large" message="Loading hotels..." />
              </View>
            ) : filteredHotels.length > 0 ? (
              <View style={styles.grid}>
                {filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    name={hotel.name}
                    address={hotel.address}
                    city={hotel.city}
                    country={hotel.country}
                    price={hotel.price}
                    rating={hotel.rating}
                    imageUrl={hotel.imageUrl}
                    onPress={() => handleHotelPress(hotel)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hotels found</Text>
                <Text style={styles.emptySubtext}>
                  Try searching for a different location
                </Text>
              </View>
            )}
          </View>
        ) : selectedCategory === 'flights' ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Flights</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {loadingFlights ? (
              <View style={styles.loadingContainer}>
                <LoadingSpinner size="large" message="Loading flights..." />
              </View>
            ) : filteredFlights.length > 0 ? (
              <View style={styles.grid}>
                {filteredFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    route={flight.route}
                    airline={flight.airline}
                    price={flight.price}
                    duration={flight.duration}
                    departureTime={flight.departureTime}
                    arrivalTime={flight.arrivalTime}
                    rating={flight.rating}
                    stops={flight.stops}
                    imageUrl={flight.imageUrl}
                    onPress={() => handleFlightPress(flight)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No flights found</Text>
                <Text style={styles.emptySubtext}>
                  Try searching for a different route
                </Text>
              </View>
            )}
          </View>
        ) : selectedCategory === 'popular' ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Destinations</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            {popularDestinations.length > 0 ? (
              <View style={styles.grid}>
                {popularDestinations.map((destination) => (
                  <DestinationCard
                    key={destination.id}
                    id={destination.id}
                    destination={destination.destination}
                    country={destination.country}
                    price={destination.price}
                    rating={destination.rating}
                    imageUrl={destination.imageUrl}
                    onPress={() => handleDestinationPress(destination)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No popular destinations found</Text>
                <Text style={styles.emptySubtext}>
                  Try searching for a different location
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Destinations</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.grid}>
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  id={destination.id}
                  destination={destination.destination}
                  country={destination.country}
                  price={destination.price}
                  rating={destination.rating}
                  imageUrl={destination.imageUrl}
                  onPress={() => handleDestinationPress(destination)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Drawer Menu */}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
        userName={userName}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  menuIcon: {
    fontSize: 24,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  searchBar: {
    marginTop: spacing.md,
  },
  categoriesContainer: {
    marginTop: spacing.md,
  },
  categoriesContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  seeAll: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  createTripBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    ...typography.h3,
    color: colors.white,
  },
  bannerSubtitle: {
    ...typography.body2,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  bannerArrow: {
    fontSize: 24,
    color: colors.white,
  },
  bottomSpacing: {
    height: 100, // Extra spacing to prevent overlap with tab bar
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textSecondary,
  },
});

