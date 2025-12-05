import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

interface MapComponentProps {
  locations: Location[];
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showUserLocation?: boolean;
  style?: any;
}

export default function MapComponent({
  locations,
  initialRegion,
  showUserLocation = false,
  style,
}: MapComponentProps) {
  // Filter out invalid coordinates (0,0 or NaN)
  const validLocations = locations.filter(
    (loc) =>
      loc.latitude !== 0 &&
      loc.longitude !== 0 &&
      !isNaN(loc.latitude) &&
      !isNaN(loc.longitude) &&
      Math.abs(loc.latitude) <= 90 &&
      Math.abs(loc.longitude) <= 180
  );

  const mapRef = useRef<MapView>(null);

  // Debug: Log locations
  useEffect(() => {
    console.log("MapComponent - Locations:", {
      total: locations.length,
      valid: validLocations.length,
      locations: locations.map(loc => ({
        name: loc.name,
        lat: loc.latitude,
        lon: loc.longitude
      }))
    });
  }, [locations, validLocations]);

  // Animate to region when locations change
  useEffect(() => {
    if (validLocations.length > 0 && mapRef.current) {
      const region = defaultRegion;
      console.log("MapComponent - Animating to region:", region);
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [validLocations, defaultRegion]);

  // Calculate default region from locations if not provided
  const defaultRegion = React.useMemo(() => {
    if (initialRegion) return initialRegion;

    if (validLocations.length === 0) {
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    if (validLocations.length === 1) {
      return {
        latitude: validLocations[0].latitude,
        longitude: validLocations[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    // Calculate bounds for multiple locations
    const latitudes = validLocations.map((loc) => loc.latitude);
    const longitudes = validLocations.map((loc) => loc.longitude);

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = Math.max((maxLat - minLat) * 1.5, 0.01);
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.01);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }, [validLocations, initialRegion]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={defaultRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        onMapReady={() => {
          console.log("MapComponent - Map ready, region:", defaultRegion);
          // Ensure map centers on location after it's ready
          if (validLocations.length > 0 && mapRef.current) {
            setTimeout(() => {
              mapRef.current?.animateToRegion(defaultRegion, 500);
            }, 100);
          }
        }}
      >
        {validLocations.map((location, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.name || `Location ${index + 1}`}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
