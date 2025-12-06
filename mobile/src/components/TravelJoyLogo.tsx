import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

interface TravelJoyLogoProps {
  size?: number;
  color?: string;
}

export default function TravelJoyLogo({ size = 64, color = colors.primary }: TravelJoyLogoProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Location Pin - positioned at center/bottom */}
      <View style={[styles.pinContainer, { 
        width: size * 0.45, 
        height: size * 0.6, 
        left: size * 0.275, 
        top: size * 0.3 
      }]}>
        {/* Pin body (heart-like top, more pronounced top-left curve) */}
        <View
          style={[
            styles.pinBody,
            {
              width: size * 0.28,
              height: size * 0.38,
              backgroundColor: color,
              borderTopLeftRadius: size * 0.14, // More pronounced curve
              borderTopRightRadius: size * 0.12,
              borderBottomLeftRadius: size * 0.14,
              borderBottomRightRadius: size * 0.14,
            },
          ]}
        />
        {/* Pin point (triangle) */}
        <View
          style={[
            styles.pinPoint,
            {
              width: 0,
              height: 0,
              borderLeftWidth: size * 0.035,
              borderRightWidth: size * 0.035,
              borderTopWidth: size * 0.11,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderTopColor: color,
              top: size * 0.38,
              left: size * 0.105,
            },
          ]}
        />
        {/* Small curved line/ripple below pin */}
        <View
          style={[
            styles.ripple,
            {
              width: size * 0.07,
              height: size * 0.025,
              backgroundColor: color,
              borderRadius: size * 0.012,
              top: size * 0.5,
              left: size * 0.19,
              opacity: 0.6,
            },
          ]}
        />
      </View>

      {/* Airplane - positioned above and to the right, wing overlapping pin */}
      <View style={[styles.airplaneContainer, { 
        width: size * 0.55, 
        height: size * 0.35, 
        top: size * 0.1, 
        left: size * 0.35 
      }]}>
        {/* Airplane body (main fuselage, angled up and right) */}
        <View
          style={[
            styles.airplaneBody,
            {
              width: size * 0.28,
              height: size * 0.055,
              backgroundColor: color,
              borderRadius: size * 0.027,
              top: size * 0.15,
              left: size * 0.12,
              transform: [{ rotate: '25deg' }],
            },
          ]}
        />
        {/* Left wing (extending from body) */}
        <View
          style={[
            styles.wing,
            {
              width: size * 0.18,
              height: size * 0.045,
              backgroundColor: color,
              borderRadius: size * 0.022,
              top: size * 0.16,
              left: size * 0.15,
              transform: [{ rotate: '-20deg' }],
            },
          ]}
        />
        {/* Right wing (overlapping pin's upper-right curve) */}
        <View
          style={[
            styles.wing,
            {
              width: size * 0.18,
              height: size * 0.045,
              backgroundColor: color,
              borderRadius: size * 0.022,
              top: size * 0.16,
              left: size * 0.22,
              transform: [{ rotate: '70deg' }],
            },
          ]}
        />
        {/* Tail fin */}
        <View
          style={[
            styles.tail,
            {
              width: size * 0.055,
              height: size * 0.12,
              backgroundColor: color,
              borderRadius: size * 0.01,
              top: size * 0.12,
              left: size * 0.08,
              transform: [{ rotate: '0deg' }],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinBody: {
    position: 'absolute',
  },
  pinPoint: {
    position: 'absolute',
  },
  ripple: {
    position: 'absolute',
  },
  airplaneContainer: {
    position: 'absolute',
  },
  airplaneBody: {
    position: 'absolute',
  },
  wing: {
    position: 'absolute',
  },
  tail: {
    position: 'absolute',
  },
});

