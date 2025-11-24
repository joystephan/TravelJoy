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

interface ExploreScreenProps {
  navigation: any;
}

// Sample destination data - in production, this would come from an API
const POPULAR_DESTINATIONS = [
  {
    id: '1',
    destination: 'Paris',
    country: 'France',
    price: 150,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400',
  },
  {
    id: '2',
    destination: 'London',
    country: 'England',
    price: 180,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400',
  },
  {
    id: '3',
    destination: 'Tokyo',
    country: 'Japan',
    price: 200,
    rating: 4.9,
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
  },
  {
    id: '4',
    destination: 'New York',
    country: 'USA',
    price: 220,
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400',
  },
  {
    id: '5',
    destination: 'Barcelona',
    country: 'Spain',
    price: 140,
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400',
  },
  {
    id: '6',
    destination: 'Dubai',
    country: 'UAE',
    price: 250,
    rating: 4.7,
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400',
  },
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

  useEffect(() => {
    loadUser();
  }, []);

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

  const filteredDestinations = POPULAR_DESTINATIONS.filter((dest) =>
    dest.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDestinationPress = (destination: any) => {
    navigation.navigate('CreateTrip', { destination: destination.destination });
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
              style={styles.profileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFilterPress={() => {/* Filter functionality */}}
            style={styles.searchBar}
          />
        </View>

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

        {/* Popular Destinations */}
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

        {/* Featured Banner */}
        <TouchableOpacity
          style={styles.featuredBanner}
          onPress={() => navigation.navigate('CreateTrip')}
          activeOpacity={0.8}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerEmoji}>✨</Text>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Plan Your Dream Trip</Text>
              <Text style={styles.bannerSubtitle}>
                AI-powered itineraries in seconds
              </Text>
            </View>
            <Text style={styles.bannerArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  profileIcon: {
    fontSize: 24,
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
  featuredBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
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
    height: spacing.xl,
  },
});

