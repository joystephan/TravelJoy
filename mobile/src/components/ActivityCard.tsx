import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from "react-native";
import { Activity } from "../types";
import { colors, typography, borderRadius, spacing } from "../theme";
import LocationMapModal from "./LocationMapModal";

interface ActivityCardProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActivityCard({
  activity,
  onEdit,
  onDelete,
}: ActivityCardProps) {
  const [mapModalVisible, setMapModalVisible] = useState(false);

  const openMapModal = () => {
    setMapModalVisible(true);
  };

  const closeMapModal = () => {
    setMapModalVisible(false);
  };

  const getDirections = () => {
    const { latitude, longitude } = activity;
    
    // Close the modal first
    closeMapModal();
    
    // Use proper URL schemes that start navigation
    const url = Platform.select({
      ios: `http://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to web maps
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
          Linking.openURL(webUrl);
        }
      }).catch(() => {
        // Fallback to web maps
        const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        Linking.openURL(webUrl);
      });
    } else {
      // Fallback to web maps
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      Linking.openURL(webUrl);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{activity.name}</Text>
            <TouchableOpacity
              style={styles.mapIconButton}
              onPress={openMapModal}
            >
              <Text style={styles.mapIcon}>📍</Text>
            </TouchableOpacity>
          </View>
          {activity.description && (
            <Text style={styles.description}>{activity.description}</Text>
          )}
          <View style={styles.details}>
            <Text style={styles.category}>{activity.category}</Text>
            <Text style={styles.duration}>{activity.duration} min</Text>
            <Text style={styles.cost}>${activity.cost.toFixed(2)}</Text>
          </View>
          {activity.rating && (
            <Text style={styles.rating}>⭐ {activity.rating.toFixed(1)}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LocationMapModal
        visible={mapModalVisible}
        onClose={closeMapModal}
        location={{
          latitude: activity.latitude,
          longitude: activity.longitude,
          name: activity.name,
        }}
        onGetDirections={getDirections}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  content: {
    marginBottom: spacing.sm,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  name: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
  },
  mapIconButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  mapIcon: {
    fontSize: 20,
  },
  description: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  category: {
    ...typography.body2,
    color: colors.primary,
    textTransform: "capitalize",
    fontWeight: "600",
  },
  duration: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  cost: {
    ...typography.body2,
    fontWeight: "600",
    color: colors.success,
  },
  rating: {
    ...typography.body2,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "flex-start",
  },
  editButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  editButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#AF363C",
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  deleteButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
});
