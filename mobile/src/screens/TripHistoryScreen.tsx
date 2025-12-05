import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { tripService } from "../services/tripService";
import { Trip } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import { colors, spacing, borderRadius, shadows, typography } from "../theme";

export default function TripHistoryScreen({ navigation }: any) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getUserTrips();
      setTrips(data);
    } catch (error) {
      console.error("Failed to load trips:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#34C759";
      case "upcoming":
        return "#007AFF";
      case "in_progress":
        return "#FF9500";
      case "cancelled":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const renderTripCard = ({ item }: { item: Trip }) => (
    <TouchableOpacity
      style={styles.tripCard}
      onPress={() => navigation.navigate("TripDetail", { tripId: item.id })}
    >
      <View style={styles.tripHeader}>
        <Text style={styles.destination}>{item.destination}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <View style={styles.tripDetails}>
        <Text style={styles.dates}>
          📅 {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
        <Text style={styles.budget}>💰 ${item.budget.toFixed(2)}</Text>
      </View>
      {item.createdAt && (
        <Text style={styles.createdAt}>
          Created {formatDate(item.createdAt)}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Loading trips..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      {trips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✈️</Text>
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptyText}>
            Start planning your next adventure!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate("CreateTrip")}
          >
            <Text style={styles.createButtonText}>Create Trip</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripCard}
          keyExtractor={(item) => item.id}
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
  tripCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  destination: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
    fontWeight: "600",
    color: colors.white,
    textTransform: "capitalize",
  },
  tripDetails: {
    marginBottom: spacing.xs,
  },
  dates: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  budget: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  createdAt: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  createButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
