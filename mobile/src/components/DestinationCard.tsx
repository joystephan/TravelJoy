import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';
import { useWishlist } from '../contexts/WishlistContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 3) / 2;

interface DestinationCardProps {
  id?: string;
  destination: string;
  country: string;
  price: number;
  rating: number;
  imageUrl?: string;
  onPress: () => void;
}

export default function DestinationCard({
  id,
  destination,
  country,
  price,
  rating,
  imageUrl,
  onPress,
}: DestinationCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400';
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Generate ID if not provided (for backward compatibility)
  const itemId = id || `${destination}-${country}`.toLowerCase().replace(/\s+/g, '-');

  useEffect(() => {
    setIsWishlisted(isInWishlist(itemId));
  }, [itemId, isInWishlist]);

  const handleHeartPress = async (e: any) => {
    e.stopPropagation();
    try {
      if (isWishlisted) {
        await removeFromWishlist(itemId);
        setIsWishlisted(false);
      } else {
        await addToWishlist({
          id: itemId,
          destination,
          country,
          price,
          rating,
          imageUrl,
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: imageUrl || defaultImage }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Heart Icon - Wishlist Button */}
      <TouchableOpacity
        style={styles.heartButton}
        onPress={handleHeartPress}
      >
        <Text style={styles.heartIcon}>
          {isWishlisted ? '❤️' : '🤍'}
        </Text>
      </TouchableOpacity>
      
      {/* Rating Badge */}
      <View style={styles.ratingBadge}>
        <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.destination} numberOfLines={1}>
          {destination}
        </Text>
        <Text style={styles.country} numberOfLines={1}>
          {country}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>
            <Text style={styles.priceLabel}>from </Text>
            ${price}
            <Text style={styles.priceUnit}>/day</Text>
          </Text>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationIcon}>📍</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
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
    padding: 4,
  },
  heartIcon: {
    fontSize: 12,
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
});



