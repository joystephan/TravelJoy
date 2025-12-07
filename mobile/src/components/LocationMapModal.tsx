import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import MapComponent from "./MapComponent";
import { spacing, borderRadius, typography } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { geocodeDestination, getDefaultCoordinatesForDestination } from "../utils/geocoding";

const { width, height } = Dimensions.get("window");

interface LocationMapModalProps {
  visible: boolean;
  onClose: () => void;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  destination?: string; // Optional destination context for better geocoding
  onGetDirections?: (latitude: number, longitude: number) => void;
}

export default function LocationMapModal({
  visible,
  onClose,
  location,
  destination,
  onGetDirections,
}: LocationMapModalProps) {
  const { colors } = useTheme();
  const [geocodedLocation, setGeocodedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Check if original coordinates are valid
  const isOriginalValid = 
    location.latitude !== 0 && 
    location.longitude !== 0 && 
    !isNaN(location.latitude) && 
    !isNaN(location.longitude) &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180;

  // Use geocoded location if original is invalid
  const isValidLocation = isOriginalValid || geocodedLocation !== null;
  const displayLocation = isOriginalValid 
    ? location 
    : geocodedLocation 
      ? { ...location, latitude: geocodedLocation.latitude, longitude: geocodedLocation.longitude }
      : location;

  // Try to geocode location name if coordinates are invalid (only once per location)
  useEffect(() => {
    // Only run if modal is visible, coordinates are invalid, and we haven't already geocoded
    if (!visible || isOriginalValid || geocodedLocation || isGeocoding) {
      return;
    }

    setIsGeocoding(true);
    
    // First, try to get destination fallback coordinates immediately as a safety net
    let destinationFallback: { latitude: number; longitude: number } | null = null;
    if (destination) {
      const fallbackCoords = getDefaultCoordinatesForDestination(destination);
      if (fallbackCoords) {
        destinationFallback = fallbackCoords;
      }
    }
    
    // Use destination context if available for better geocoding results
    geocodeDestination(location.name, destination || undefined)
      .then((coords) => {
        if (coords) {
          setGeocodedLocation(coords);
        } else {
          // If geocoding fails, use destination fallback
          if (destinationFallback) {
            setGeocodedLocation(destinationFallback);
          } else if (destination) {
            // Last resort: try to geocode just the destination name
            geocodeDestination(destination)
              .then((destCoords) => {
                if (destCoords) {
                  setGeocodedLocation(destCoords);
                } else if (destinationFallback) {
                  setGeocodedLocation(destinationFallback);
                }
              })
              .catch(() => {
                if (destinationFallback) {
                  setGeocodedLocation(destinationFallback);
                }
              });
          }
        }
      })
      .catch((error) => {
        console.warn('Failed to geocode location:', error);
        // Use destination fallback on error
        if (destinationFallback) {
          setGeocodedLocation(destinationFallback);
        } else if (destination) {
          // Last resort: try to geocode just the destination name
          geocodeDestination(destination)
            .then((destCoords) => {
              if (destCoords) {
                setGeocodedLocation(destCoords);
              }
            })
            .catch(() => {
              // Silently fail
            });
        }
      })
      .finally(() => {
        setIsGeocoding(false);
      });
  }, [visible, location.name, location.latitude, location.longitude, destination, isOriginalValid]);

  // Reset geocoded location when modal closes
  useEffect(() => {
    if (!visible) {
      setGeocodedLocation(null);
      setIsGeocoding(false);
    }
  }, [visible]);

  // Debug: Log coordinates when modal opens
  useEffect(() => {
    if (visible) {
      console.log("LocationMapModal - Location:", {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        isValid: isOriginalValid,
        geocoded: geocodedLocation !== null,
      });
    }
  }, [visible, location, isOriginalValid, geocodedLocation]);

  const styles = createStyles(colors);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{location.name}</Text>
              {/* Debug: Show coordinates for testing */}
              <Text style={styles.coordinates}>
                {isValidLocation 
                  ? `${displayLocation.latitude.toFixed(4)}, ${displayLocation.longitude.toFixed(4)}`
                  : isGeocoding
                    ? "Looking up..."
                    : "Invalid coordinates"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            {isGeocoding ? (
              <View style={styles.errorContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.errorTitle}>Finding location...</Text>
                <Text style={styles.errorMessage}>
                  Looking up coordinates for {location.name}
                </Text>
              </View>
            ) : isValidLocation ? (
              <MapComponent
                key={`${displayLocation.latitude}-${displayLocation.longitude}`}
                locations={[displayLocation]}
                style={styles.map}
              />
            ) : (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>📍</Text>
                <Text style={styles.errorTitle}>Location Not Available</Text>
                <Text style={styles.errorMessage}>
                  Coordinates: {location.latitude}, {location.longitude}
                </Text>
                <Text style={styles.errorMessage}>
                  Could not find coordinates for this location.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            {onGetDirections && isValidLocation && displayLocation && (
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => {
                  // Use geocoded coordinates if available, otherwise use original
                  const lat = displayLocation.latitude;
                  const lon = displayLocation.longitude;
                  if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
                    onGetDirections(lat, lon);
                  }
                }}
              >
                <Text style={styles.directionsButtonText}>🗺️ Get Directions</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={onClose}
            >
              <Text style={styles.closeModalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: height * 0.8,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  coordinates: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontFamily: "monospace",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  mapContainer: {
    flex: 1,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: "hidden",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  actions: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  directionsButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  directionsButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  closeModalButton: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  closeModalButtonText: {
    ...typography.button,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
});

