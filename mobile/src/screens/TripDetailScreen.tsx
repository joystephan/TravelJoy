import React, { useState, useEffect, useMemo } from "react";
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
import { spacing, borderRadius, shadows, typography } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import { geocodeDestination, getDefaultCoordinatesForDestination } from "../utils/geocoding";

const { width } = Dimensions.get('window');

// Helper function to remove "- Day X" suffix from names
const cleanName = (name: string): string => {
  if (!name) return name;
  // Remove patterns like " - Day 1", " - Day 2", etc.
  return name.replace(/\s*-\s*Day\s+\d+\s*$/i, '').trim();
};

interface TripDetailScreenProps {
  route: any;
  navigation: any;
}

export default function TripDetailScreen({
  route,
  navigation,
}: TripDetailScreenProps) {
  const { colors } = useTheme();
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(0);
  const [dayChangeKey, setDayChangeKey] = useState(0); // Force re-render when day changes
  const [refreshing, setRefreshing] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  // Auto-refresh when trip is being generated
  useEffect(() => {
    // Only poll if trip exists and status indicates generation in progress
    const isGenerating = trip?.status === "generating" || trip?.status === "pending";
    if (!trip || !isGenerating) {
      return;
    }

    // Poll every 2 seconds for faster updates
    const pollInterval = setInterval(async () => {
      try {
        const tripData = await tripService.getTripById(tripId);
        console.log('Polling trip update:', {
          status: tripData.status,
          dailyPlansCount: tripData.dailyPlans?.length || 0,
        });
        setTrip(tripData);
        
        // Stop polling if trip is completed, failed, or has daily plans
        if (tripData.status === "completed" || 
            tripData.status === "failed" ||
            (tripData.dailyPlans && tripData.dailyPlans.length > 0)) {
          clearInterval(pollInterval);
        }
      } catch (error) {
        // Silently fail during polling - don't show errors
        console.error("Polling error:", error);
      }
    }, 2000); // Poll every 2 seconds for faster updates

    // Cleanup interval on unmount or when trip status changes
    return () => {
      clearInterval(pollInterval);
    };
  }, [trip?.status, tripId]);

  // Ensure selectedDay is within bounds and reset if needed
  // This must be before any conditional returns to follow Rules of Hooks
  useEffect(() => {
    if (trip?.dailyPlans && Array.isArray(trip.dailyPlans) && trip.dailyPlans.length > 0) {
      if (selectedDay >= trip.dailyPlans.length) {
        console.log('Resetting selectedDay from', selectedDay, 'to 0 (dailyPlans length:', trip.dailyPlans.length, ')');
        setSelectedDay(0);
      }
    }
  }, [trip?.dailyPlans?.length, selectedDay]);

  // Check if trip has daily plans - must be before any conditional returns
  const hasDailyPlans = trip?.dailyPlans && Array.isArray(trip.dailyPlans) && trip.dailyPlans.length > 0;
  
  // Ensure we have a valid day plan for the selected day
  // Use useMemo to ensure it recalculates when selectedDay or trip changes
  // MUST be before any conditional returns to follow Rules of Hooks
  const safeSelectedDay = useMemo(() => {
    if (!hasDailyPlans || !trip) return 0;
    return selectedDay < trip.dailyPlans.length ? selectedDay : 0;
  }, [hasDailyPlans, selectedDay, trip?.dailyPlans?.length]);
  
  const currentDayPlan = useMemo(() => {
    if (!hasDailyPlans || !trip || safeSelectedDay >= trip.dailyPlans.length) {
      return null;
    }
    const plan = trip.dailyPlans[safeSelectedDay];
    console.log('Current Day Plan (useMemo):', {
      selectedDay,
      safeSelectedDay,
      planId: plan?.id,
      planDate: plan?.date,
      activitiesCount: plan?.activities?.length || 0,
      mealsCount: plan?.meals?.length || 0,
      transportationsCount: plan?.transportations?.length || 0,
    });
    return plan || null;
  }, [hasDailyPlans, trip, safeSelectedDay, selectedDay]);
  
  // Get activities for the current day only - use useMemo to ensure they update when day changes
  const currentDayActivities = useMemo(() => {
    if (!currentDayPlan) return [];
    const activities = currentDayPlan.activities || [];
    // Create a completely new array with new object references to force React to see them as different
    const newActivities = activities.map((a: any) => ({
      ...a,
      name: cleanName(a.name || a.title || ''),
      _dayKey: `${selectedDay}-${currentDayPlan.id}`, // Add a unique key per day
    }));
    console.log('currentDayActivities memoized:', {
      selectedDay,
      planId: currentDayPlan.id,
      activitiesCount: newActivities.length,
      activityNames: newActivities.map((a: any) => a.name || a.title || 'unnamed'),
      activityIds: newActivities.map((a: any) => a.id),
      fullActivities: newActivities.map((a: any) => ({
        id: a.id,
        name: a.name || a.title,
        description: a.description,
        cost: a.cost,
        _dayKey: a._dayKey,
      })),
    });
    return newActivities;
  }, [currentDayPlan, selectedDay]);
  
  const currentDayMeals = useMemo(() => {
    if (!currentDayPlan) return [];
    const meals = currentDayPlan.meals || [];
    // Create a completely new array with new object references
    const newMeals = meals.map((m: any) => ({
      ...m,
      name: cleanName(m.name || m.restaurantName || ''),
      _dayKey: `${selectedDay}-${currentDayPlan.id}`,
    }));
    console.log('currentDayMeals memoized:', {
      selectedDay,
      planId: currentDayPlan.id,
      mealsCount: newMeals.length,
      meals: newMeals.map((m: any) => ({
        id: m.id,
        name: m.name || m.restaurantName || 'unnamed',
        cost: m.cost
      })),
    });
    return newMeals;
  }, [currentDayPlan, selectedDay]);
  
  const currentDayTransportations = useMemo(() => {
    if (!currentDayPlan) return [];
    const transportations = currentDayPlan.transportations || [];
    // Create a completely new array with new object references
    const newTransportations = transportations.map((t: any) => ({
      ...t,
      _dayKey: `${selectedDay}-${currentDayPlan.id}`,
    }));
    console.log('currentDayTransportations memoized:', {
      selectedDay,
      planId: currentDayPlan.id,
      transportationsCount: newTransportations.length,
      transportIds: newTransportations.map((t: any) => t.id),
    });
    return newTransportations;
  }, [currentDayPlan, selectedDay]);

  // Calculate actual daily budget from current items
  const calculatedDailyBudget = useMemo(() => {
    const activitiesCost = currentDayActivities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
    const mealsCost = currentDayMeals.reduce((sum, meal) => sum + (meal.cost || 0), 0);
    const transportCost = currentDayTransportations.reduce((sum, transport) => sum + (transport.cost || 0), 0);
    const total = activitiesCost + mealsCost + transportCost;
    
    console.log('Daily budget calculation:', {
      selectedDay,
      activitiesCost,
      mealsCost,
      transportCost,
      total,
      activitiesBreakdown: currentDayActivities.map(a => ({ name: a.name, cost: a.cost })),
      mealsBreakdown: currentDayMeals.map(m => ({ name: m.name, cost: m.cost })),
      transportBreakdown: currentDayTransportations.map(t => ({ mode: t.mode, cost: t.cost })),
    });
    
    return total;
  }, [currentDayActivities, currentDayMeals, currentDayTransportations, selectedDay]);

  // Calculate map region for current day based on first activity
  const currentDayMapRegion = useMemo(() => {
    // Use first activity location if available, otherwise use destination coordinates
    if (currentDayActivities.length > 0 && 
        currentDayActivities[0].latitude !== 0 && 
        currentDayActivities[0].longitude !== 0) {
      return {
        latitude: currentDayActivities[0].latitude,
        longitude: currentDayActivities[0].longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    
    // Fallback to destination coordinates
    if (destinationCoordinates) {
      return {
        latitude: destinationCoordinates.latitude,
        longitude: destinationCoordinates.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }
    
    return undefined;
  }, [currentDayActivities, destinationCoordinates, selectedDay]);
  
  // Debug logging when selectedDay changes
  useEffect(() => {
    if (trip && hasDailyPlans && currentDayPlan) {
      console.log('Day changed:', {
        selectedDay,
        safeSelectedDay,
        dayPlanId: currentDayPlan.id,
        dayPlanDate: currentDayPlan.date,
        activitiesCount: currentDayActivities.length,
        mealsCount: currentDayMeals.length,
        transportationsCount: currentDayTransportations.length,
        firstActivity: currentDayActivities[0]?.name || currentDayActivities[0]?.title || 'none',
        firstMeal: currentDayMeals[0]?.name || currentDayMeals[0]?.restaurantName || 'none',
        allActivityNames: currentDayActivities.map((a: any) => a.name || a.title || 'unnamed'),
      });
    }
  }, [selectedDay, trip?.id, currentDayPlan?.id]);

  const loadTrip = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const tripData = await tripService.getTripById(tripId);
      console.log('Trip loaded:', {
        id: tripData.id,
        destination: tripData.destination,
        status: tripData.status,
        dailyPlansCount: tripData.dailyPlans?.length || 0,
        hasDailyPlans: !!tripData.dailyPlans,
        dailyPlansType: Array.isArray(tripData.dailyPlans) ? 'array' : typeof tripData.dailyPlans,
        firstDailyPlan: tripData.dailyPlans?.[0] ? {
          id: tripData.dailyPlans[0].id,
          date: tripData.dailyPlans[0].date,
          activitiesCount: tripData.dailyPlans[0].activities?.length || 0,
          mealsCount: tripData.dailyPlans[0].meals?.length || 0,
          transportationsCount: tripData.dailyPlans[0].transportations?.length || 0,
        } : null,
      });
      
      // Log all daily plans to check if they have different data
      if (tripData.dailyPlans && Array.isArray(tripData.dailyPlans)) {
        console.log('All Daily Plans Summary:');
        tripData.dailyPlans.forEach((plan: any, index: number) => {
          console.log(`Day ${index + 1}:`, {
            id: plan.id,
            date: plan.date,
            activities: plan.activities?.map((a: any) => a.name || a.title) || [],
            meals: plan.meals?.map((m: any) => ({
              name: m.name || m.restaurantName,
              cost: m.cost,
              id: m.id
            })) || [],
            transportations: plan.transportations?.map((t: any) => t.type || t.mode) || [],
          });
        });
      }
      
      // Force a complete state update with a new object reference
      setTrip({ ...tripData, _refreshKey: Date.now() });
      
      // Fetch destination coordinates for the map
      if (tripData.destination) {
        try {
          const coords = await geocodeDestination(tripData.destination);
          if (coords) {
            setDestinationCoordinates(coords);
          } else {
            // Try fallback for common destinations
            const fallbackCoords = getDefaultCoordinatesForDestination(tripData.destination);
            if (fallbackCoords) {
              setDestinationCoordinates(fallbackCoords);
            }
          }
        } catch (error) {
          console.warn('Failed to geocode destination:', error);
          // Try fallback
          const fallbackCoords = getDefaultCoordinatesForDestination(tripData.destination);
          if (fallbackCoords) {
            setDestinationCoordinates(fallbackCoords);
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to load trip:', error);
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
              await tripService.deleteMeal(mealId);
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

  const styles = createStyles(colors);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your trip...</Text>
      </View>
    );
  }

  // Debug logging
  if (trip && hasDailyPlans && !currentDayPlan) {
    console.log('Debug: currentDayPlan is null', {
      selectedDay,
      dailyPlansLength: trip.dailyPlans.length,
      dailyPlansArray: trip.dailyPlans.map((dp: any, idx: number) => ({
        index: idx,
        id: dp.id,
        date: dp.date,
        hasActivities: !!dp.activities,
        activitiesCount: dp.activities?.length || 0,
      })),
    });
  }
  
  if (!trip || !hasDailyPlans || !currentDayPlan) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>✈️</Text>
        <Text style={styles.emptyText}>
          {trip?.status === "generating" || trip?.status === "pending"
            ? "Your itinerary is being generated..."
            : trip?.status === "failed"
            ? "Failed to generate itinerary. Please try again."
            : "No itinerary available"}
        </Text>
        {(trip?.status === "generating" || trip?.status === "pending") && (
          <View style={styles.pollingIndicator}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.pollingText}>
              Creating your perfect itinerary...
            </Text>
            <Text style={styles.pollingSubtext}>
              This usually takes 10-15 seconds
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
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView 
        key={`day-${selectedDay}-${currentDayPlan?.id || 'none'}-${dayChangeKey}`}
        style={styles.container} 
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Map */}
        <View style={styles.hero}>
          {/* Real Map */}
          <View style={styles.map}>
            <MapComponent
              key={`map-${selectedDay}-${currentDayPlan?.id}-${dayChangeKey}`}
              locations={currentDayActivities.map((activity) => ({
                latitude: activity.latitude,
                longitude: activity.longitude,
                name: activity.name,
              }))}
              initialRegion={currentDayMapRegion}
              style={styles.mapComponent}
            />
          </View>

          {/* Gradient Overlay */}
          <View style={[styles.heroOverlay, { backgroundColor: colors.mode === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.3)' }]} />

          {/* Trip Header */}
          <View style={styles.heroContent}>
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
                onPress={() => {
                  setSelectedDay(index);
                  setDayChangeKey(prev => prev + 1); // Force re-render
                }}
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

        {/* Content Wrapper - Force complete remount when day changes */}
        <View key={`day-content-${selectedDay}-${currentDayPlan?.id}-${dayChangeKey}`}>
          {/* Daily Budget Banner */}
          <View style={styles.budgetBanner}>
            <View style={styles.budgetContent}>
              <Text style={styles.budgetLabel}>Daily Budget</Text>
              <Text style={styles.budgetAmount}>
                ${calculatedDailyBudget.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Activities Section */}
          {currentDayActivities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 Activities</Text>
              {currentDayActivities.map((activity, index) => {
                // Create a unique key that includes all relevant identifiers
                const uniqueKey = `activity-${selectedDay}-${currentDayPlan?.id}-${activity.id}-${dayChangeKey}-${index}`;
                return (
                  <View key={uniqueKey}>
                    <ActivityCard
                      key={`card-${uniqueKey}`}
                      activity={activity}
                      onEdit={() => handleEditActivity(activity)}
                      onDelete={() => handleDeleteActivity(activity.id)}
                      renderKey={`${selectedDay}-${currentDayPlan?.id}-${activity.id}-${dayChangeKey}`}
                    />
                    {index < currentDayActivities.length - 1 && (
                      <View style={styles.timelineDivider} key={`divider-${uniqueKey}`}>
                        <View style={styles.timelineDot} />
                        <View style={styles.timelineLine} />
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Meals Section */}
          {currentDayMeals.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🍽️ Meals</Text>
              {currentDayMeals.map((meal, mealIndex) => {
                const mealUniqueKey = `meal-${selectedDay}-${currentDayPlan?.id}-${meal.id}-${dayChangeKey}-${mealIndex}`;
                return (
                  <View key={mealUniqueKey} style={styles.mealCard}>
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
                );
              })}
            </View>
          )}

          {/* Transportation Section */}
          {currentDayTransportations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🚗 Transportation</Text>
              {currentDayTransportations.map((transport, transportIndex) => {
                const transportUniqueKey = `transport-${selectedDay}-${currentDayPlan?.id}-${transport.id}-${dayChangeKey}-${transportIndex}`;
                return (
                  <View key={transportUniqueKey} style={styles.transportCard}>
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
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {selectedLocation && trip && (
        <LocationMapModal
          visible={mapModalVisible}
          onClose={closeMapModal}
          location={selectedLocation || { latitude: 0, longitude: 0, name: '' }}
          destination={trip.destination || undefined}
          onGetDirections={(latitude, longitude) => {
            getDirections(latitude, longitude);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
    marginTop: spacing.xl,
    alignItems: "center",
    padding: spacing.lg,
  },
  pollingText: {
    ...typography.h4,
    color: colors.textPrimary,
    marginTop: spacing.md,
    fontWeight: "600",
    textAlign: "center",
  },
  pollingSubtext: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  hero: {
    height: 300,
    position: 'relative',
    marginBottom: spacing.md,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surface,
  },
  mapComponent: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Default, will be overridden dynamically
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    padding: spacing.md,
    justifyContent: 'flex-end',
  },
  heroInfo: {
    marginBottom: spacing.md,
  },
  destination: {
    ...typography.display1,
    color: colors.white,
    marginBottom: spacing.sm,
    textShadowColor: colors.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: colors.mode === 'dark' ? 6 : 4,
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
    textShadowColor: colors.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
    margin: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
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
