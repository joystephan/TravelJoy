import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useWishlist } from '../contexts/WishlistContext';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';
import LoadingSpinner from '../components/LoadingSpinner';

export default function WishlistScreen({ navigation }: any) {
  const { wishlist, isLoading, removeFromWishlist, refreshWishlist } = useWishlist();
  const [refreshing, setRefreshing] = useState(false);

  const handleRemove = (itemId: string, destination: string) => {
    Alert.alert(
      'Remove from Wishlist',
      `Remove ${destination} from your wishlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromWishlist(itemId);
            } catch (error) {
              Alert.alert('Error', 'Failed to remove item from wishlist');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshWishlist();
    setRefreshing(false);
  };

  const handleDestinationPress = (item: any) => {
    navigation.navigate('CreateTrip', { destination: item.destination });
  };

  const renderWishlistItem = ({ item }: { item: any }) => {
    const defaultImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleDestinationPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.imageUrl || defaultImage }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
        </View>

        {/* Heart Icon - Remove Button */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => handleRemove(item.id, item.destination)}
        >
          <Text style={[styles.heartIcon, { color: '#FF3B30' }]}>❤️</Text>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.destination} numberOfLines={1}>
            {item.destination}
          </Text>
          <Text style={styles.country} numberOfLines={1}>
            {item.country}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.price}>
              <Text style={styles.priceLabel}>from </Text>
              ${item.price}
              <Text style={styles.priceUnit}>/day</Text>
            </Text>
            <TouchableOpacity style={styles.locationButton}>
              <Text style={styles.locationIcon}>📍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} message="Loading wishlist..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {wishlist.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptyText}>
            Start adding destinations to your wishlist to plan your next adventure!
          </Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.exploreButtonText}>Explore Destinations</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          renderItem={renderWishlistItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          style={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 120, // Extra spacing to prevent overlap with tab bar
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.gray200,
  },
  ratingBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    ...shadows.sm,
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  heartButton: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  heartIcon: {
    fontSize: 18,
  },
  content: {
    padding: spacing.sm,
  },
  destination: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  country: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '700',
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  priceUnit: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  locationButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  exploreButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  exploreButtonText: {
    ...typography.button,
    color: colors.white,
  },
});

