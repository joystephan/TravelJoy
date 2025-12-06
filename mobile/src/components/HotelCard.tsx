import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 3) / 2;

interface HotelCardProps {
  name: string;
  address: string;
  city: string;
  country: string;
  price: number;
  rating: number;
  imageUrl?: string;
  onPress: () => void;
}

export default function HotelCard({
  name,
  address,
  city,
  country,
  price,
  rating,
  imageUrl,
  onPress,
}: HotelCardProps) {
  const defaultImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';

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
      
      {/* Rating Badge */}
      <View style={styles.ratingBadge}>
        <Text style={styles.ratingText}>⭐ {rating.toFixed(1)}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {city}, {country}
        </Text>
        
        <View style={styles.footer}>
          <Text style={styles.price}>
            <Text style={styles.priceLabel}>from </Text>
            ${price}
            <Text style={styles.priceUnit}>/night</Text>
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
  content: {
    padding: spacing.sm,
  },
  name: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  location: {
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


