import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MapComponent from "./MapComponent";
import { colors, spacing, borderRadius, typography } from "../theme";

const { width, height } = Dimensions.get("window");

interface LocationMapModalProps {
  visible: boolean;
  onClose: () => void;
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  onGetDirections?: () => void;
}

export default function LocationMapModal({
  visible,
  onClose,
  location,
  onGetDirections,
}: LocationMapModalProps) {
  // Debug: Log coordinates when modal opens
  React.useEffect(() => {
    if (visible) {
      console.log("LocationMapModal - Location:", {
        name: location.name,
        latitude: location.latitude,
        longitude: location.longitude,
        isValid: location.latitude !== 0 && location.longitude !== 0 && 
                 !isNaN(location.latitude) && !isNaN(location.longitude)
      });
    }
  }, [visible, location]);

  // Check if coordinates are valid
  const isValidLocation = 
    location.latitude !== 0 && 
    location.longitude !== 0 && 
    !isNaN(location.latitude) && 
    !isNaN(location.longitude) &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180;

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
                  ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                  : "Invalid coordinates"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            {isValidLocation ? (
              <MapComponent
                key={`${location.latitude}-${location.longitude}`}
                locations={[location]}
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
                  This location doesn't have valid coordinates.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            {onGetDirections && (
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={onGetDirections}
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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    height: height * 0.8,
    paddingTop: spacing.md,
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
    backgroundColor: colors.gray100,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
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

