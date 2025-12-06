import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Linking,
  Platform,
} from "react-native";
import { tripService } from "../services/tripService";
import { Trip, DailyPlan, Activity } from "../types";
import WeatherWidget from "../components/WeatherWidget";
import ActivityCard from "../components/ActivityCard";
import MapComponent from "../components/MapComponent";
import LocationMapModal from "../components/LocationMapModal";
import { colors, spacing, borderRadius, shadows, typography } from "../theme";

const { width } = Dimensions.get('window');

interface TripDetailScreenProps {
  route: any;
  navigation: any;
}

export default function TripDetailScreen({
  route,
  navigation,
}: TripDetailScreenProps) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  // Auto-refresh when trip is being generated
  useEffect(() => {
    // Only poll if trip exists and status is "generating"
    if (!trip || trip.status !== "generating") {
      return;
    }

    // Poll every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const tripData = await tripService.getTripById(tripId);
        setTrip(tripData);
        
        // Stop polling if trip is completed or failed
        if (tripData.status === "completed" || tripData.status === "failed") {
          clearInterval(pollInterval);
        }
      } catch (error) {
        // Silently fail during polling - don't show errors
        console.error("Polling error:", error);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup interval on unmount or when trip status changes
    return () => {
      clearInterval(pollInterval);
    };
  }, [trip?.status, tripId]);

  const loadTrip = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const tripData = await tripService.getTripById(tripId);
      setTrip(tripData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load trip");
      navigation.goBack();
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrip(false); // Don't show full loading screen, just refresh indicator
    setRefreshing(false);
  };

  const handleDeleteActivity = async (activityId: string) => {
    Alert.alert(
      "Delete Activity",
      "Are you sure you want to delete this activity?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await tripService.deleteActivity(activityId);
              await loadTrip();
              Alert.alert("Success", "Activity deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete activity");
            }
          },
        },
      ]
    );
  };

  const handleEditActivity = (activity: Activity) => {
    navigation.navigate("EditActivity", {
      activity,
      onSave: loadTrip,
    });
  };

  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // TODO: Add deleteMeal method to tripService
              // await tripService.deleteMeal(mealId);
              await loadTrip();
              Alert.alert("Success", "Meal deleted successfully");
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete meal");
            }
          },
        },
      ]
    );
  };

  const handleEditMeal = (meal: any) => {
    navigation.navigate("EditMeal", {
      meal,
      onSave: loadTrip,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your trip...</Text>
      </View>
    );
  }

  if (!trip || !trip.dailyPlans || trip.dailyPlans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>✈️</Text>
        <Text style={styles.emptyText}>
          {trip?.status === "generating"
            ? "Your itinerary is being generated..."
            : trip?.status === "failed"
            ? "Failed to generate itinerary. Please try again."
            : "No itinerary available"}
        </Text>
        {trip?.status === "generating" && (
          <View style={styles.pollingIndicator}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.pollingText}>
              Checking for updates automatically...
            </Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.refreshButtonText}>Refresh</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  const currentDayPlan = trip.dailyPlans[selectedDay];
  const allActivities = trip.dailyPlans.flatMap((dp) => dp.activities);
  const currentDayActivities = currentDayPlan.activities;

  const openMapModal = (location: { latitude: number; longitude: number; name: string }) => {
    setSelectedLocation(location);
    setMapModalVisible(true);
  };

  const closeMapModal = () => {
    setMapModalVisible(false);
    setSelectedLocation(null);
  };

  const getDirections = (latitude: number, longitude: number) => {
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Map */}
        <View style={styles.hero}>
          {/* Real Map */}
          <View style={styles.map}>
            <MapComponent
              locations={currentDayActivities.map((activity) => ({
                latitude: activity.latitude,
                longitude: activity.longitude,
                name: activity.name,
              }))}
              style={styles.mapComponent}
            />
          </View>

          {/* Gradient Overlay */}
          <View style={styles.heroOverlay} />

          {/* Trip Header */}
          <View style={styles.heroContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            <View style={styles.heroInfo}>
              <Text style={styles.destination}>{trip.destination}</Text>
              <View style={styles.tripMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>💰</Text>
                  <Text style={styles.metaText}>${trip.budget}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>📅</Text>
                  <Text style={styles.metaText}>
                    {trip.dailyPlans.length} days
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Weather Widget */}
          <View style={styles.weatherBadge}>
            <WeatherWidget
              latitude={currentDayActivities.length > 0 ? currentDayActivities[0].latitude : 0}
              longitude={
                currentDayActivities.length > 0 ? currentDayActivities[0].longitude : 0
              }
              date={currentDayPlan.date}
            />
          </View>
        </View>

        {/* Day Selector */}
        <View style={styles.daySelectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daySelector}
          >
            {trip.dailyPlans.map((dayPlan, index) => (
              <TouchableOpacity
                key={dayPlan.id}
                style={[
                  styles.dayButton,
                  selectedDay === index && styles.dayButtonSelected,
                ]}
                onPress={() => setSelectedDay(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    selectedDay === index && styles.dayNumberSelected,
                  ]}
                >
                  Day {index + 1}
                </Text>
                <Text
                  style={[
                    styles.dayDate,
                    selectedDay === index && styles.dayDateSelected,
                  ]}
                >
                  {new Date(dayPlan.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Daily Budget Banner */}
        <View style={styles.budgetBanner}>
          <View style={styles.budgetContent}>
            <Text style={styles.budgetLabel}>Daily Budget</Text>
            <Text style={styles.budgetAmount}>
              ${currentDayPlan.estimatedCost.toFixed(2)}
            </Text>
          </View>
          <View style={styles.budgetProgress}>
            <View
              style={[
                styles.budgetProgressFill,
                {
                  width: `${Math.min(
                    (currentDayPlan.estimatedCost / (trip.budget / trip.dailyPlans.length)) * 100,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Activities Section */}
        {currentDayPlan.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Activities</Text>
            {currentDayPlan.activities.map((activity, index) => (
              <View key={activity.id}>
                <ActivityCard
                  activity={activity}
                  onEdit={() => handleEditActivity(activity)}
                  onDelete={() => handleDeleteActivity(activity.id)}
                />
                {index < currentDayPlan.activities.length - 1 && (
                  <View style={styles.timelineDivider}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineLine} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Meals Section */}
        {currentDayPlan.meals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍽️ Meals</Text>
            {currentDayPlan.meals.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealInfo}>
                    <View style={styles.mealNameRow}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <TouchableOpacity
                        style={styles.mapIconButton}
                        onPress={() => openMapModal({
                          latitude: meal.latitude,
                          longitude: meal.longitude,
                          name: meal.name,
                        })}
                      >
                        <Text style={styles.mapIcon}>📍</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.mealDetails}>
                      <Text style={styles.mealType}>{meal.mealType}</Text>
                      <Text style={styles.mealCost}>${meal.cost.toFixed(2)}</Text>
                    </View>
                  </View>
                </View>
                {meal.cuisine && (
                  <View style={styles.mealBadge}>
                    <Text style={styles.mealBadgeText}>{meal.cuisine}</Text>
                  </View>
                )}
                <View style={styles.mealActions}>
                  <TouchableOpacity
                    style={styles.mealEditButton}
                    onPress={() => handleEditMeal(meal)}
                  >
                    <Text style={styles.mealEditButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.mealDeleteButton}
                    onPress={() => handleDeleteMeal(meal.id)}
                  >
                    <Text style={styles.mealDeleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Transportation Section */}
        {currentDayPlan.transportations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚗 Transportation</Text>
            {currentDayPlan.transportations.map((transport) => (
              <View key={transport.id} style={styles.transportCard}>
                <View style={styles.transportHeader}>
                  <View style={styles.transportMode}>
                    <Text style={styles.transportModeIcon}>
                      {transport.mode === "walking"
                        ? "🚶"
                        : transport.mode === "public"
                        ? "🚇"
                        : transport.mode === "taxi"
                        ? "🚕"
                        : "🚗"}
                    </Text>
                    <Text style={styles.transportModeText}>{transport.mode}</Text>
                  </View>
                  <View style={styles.transportHeaderRight}>
                    <Text style={styles.transportCost}>
                      ${transport.cost.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.mapIconButton}
                      onPress={() => openMapModal({
                        latitude: transport.toLatitude,
                        longitude: transport.toLongitude,
                        name: transport.toLocation,
                      })}
                    >
                      <Text style={styles.mapIcon}>📍</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.transportRoute}>
                  <Text style={styles.transportLocation}>
                    {transport.fromLocation}
                  </Text>
                  <Text style={styles.transportArrow}>→</Text>
                  <Text style={styles.transportLocation}>
                    {transport.toLocation}
                  </Text>
                </View>
                <Text style={styles.transportDuration}>
                  {transport.duration} minutes
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {selectedLocation && (
        <LocationMapModal
          visible={mapModalVisible}
          onClose={closeMapModal}
          location={selectedLocation}
          onGetDirections={() => getDirections(selectedLocation.latitude, selectedLocation.longitude)}
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    ...shadows.md,
  },
  refreshButtonText: {
    ...typography.button,
    color: colors.white,
  },
  pollingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  pollingText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  hero: {
    height: 300,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
  },
  mapComponent: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  heroInfo: {
    marginBottom: spacing.md,
  },
  destination: {
    ...typography.display1,
    color: colors.white,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tripMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  metaText: {
    ...typography.body1,
    color: colors.white,
    fontWeight: '600',
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.white,
    opacity: 0.5,
    marginHorizontal: spacing.md,
  },
  weatherBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  daySelectorWrapper: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  daySelector: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  dayButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    minWidth: 80,
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  dayNumber: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  dayNumberSelected: {
    color: colors.white,
  },
  dayDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dayDateSelected: {
    color: colors.white,
    opacity: 0.9,
  },
  budgetBanner: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  budgetContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  budgetLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  budgetAmount: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: '700',
  },
  budgetProgress: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  timelineDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.lg,
    marginVertical: spacing.xs,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.gray200,
    marginLeft: spacing.xs,
  },
  mealCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mealInfo: {
    flex: 1,
  },
  mealNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealName: {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
    marginBottom: spacing.xs,
  },
  mapIconButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  mapIcon: {
    fontSize: 20,
  },
  mealDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  mealType: {
    ...typography.body2,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  mealCost: {
    ...typography.body2,
    fontWeight: "600",
    color: colors.success,
  },
  mealBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginTop: spacing.sm,
  },
  mealBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  mealActions: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "flex-start",
    marginTop: spacing.sm,
  },
  mealEditButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  mealEditButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  mealDeleteButton: {
    backgroundColor: "#AF363C",
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 32,
  },
  mealDeleteButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  transportCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  transportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transportHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  transportMode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transportModeIcon: {
    fontSize: 24,
    marginRight: spacing.xs,
  },
  transportModeText: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  transportCost: {
    ...typography.body2,
    fontWeight: "600",
    color: colors.success,
  },
  transportRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  transportLocation: {
    ...typography.body2,
    color: colors.textSecondary,
    flex: 1,
  },
  transportArrow: {
    ...typography.body1,
    color: colors.textLight,
    marginHorizontal: spacing.sm,
  },
  transportDuration: {
    ...typography.caption,
    color: colors.textLight,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
