import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - spacing.md * 3) / 2;

interface FlightCardProps {
  route: string;
  airline: string;
  price: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  rating: number;
  stops: number;
  imageUrl?: string;
  onPress: () => void;
}

export default function FlightCard({
  route,
  airline,
  price,
  duration,
  departureTime,
  arrivalTime,
  rating,
  stops,
  imageUrl,
  onPress,
}: FlightCardProps) {
  // Default airline/airplane image
  const defaultImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400';

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
        <Text style={styles.route} numberOfLines={1}>
          {route}
        </Text>
        <Text style={styles.airline} numberOfLines={1}>
          {airline}
        </Text>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{duration}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Departure:</Text>
            <Text style={styles.detailValue}>{departureTime}</Text>
          </View>
          {stops > 0 && (
            <View style={styles.stopsBadge}>
              <Text style={styles.stopsText}>
                {stops === 1 ? '1 stop' : `${stops} stops`}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            ${price}
          </Text>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => {
              Alert.alert(
                'Coming Soon',
                'Flight booking feature will be available in a future update.',
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.bookButtonText}>Book</Text>
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
    height: 120,
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
  route: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: 2,
    fontWeight: '700',
  },
  airline: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  details: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  detailValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 11,
  },
  stopsBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.warning,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  stopsText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  price: {
    ...typography.body2,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  bookButtonText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
});

