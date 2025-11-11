import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { tripService } from "../services/tripService";
import { Trip, DailyPlan, Activity } from "../types";
import WeatherWidget from "../components/WeatherWidget";
import ActivityCard from "../components/ActivityCard";

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

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    try {
      setLoading(true);
      const tripData = await tripService.getTripById(tripId);
      setTrip(tripData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to load trip");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTrip();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your trip...</Text>
      </View>
    );
  }

  if (!trip || !trip.dailyPlans || trip.dailyPlans.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {trip?.status === "generating"
            ? "Your itinerary is being generated..."
            : "No itinerary available"}
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentDayPlan = trip.dailyPlans[selectedDay];
  const allActivities = trip.dailyPlans.flatMap((dp) => dp.activities);

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: allActivities.length > 0 ? allActivities[0].latitude : 0,
            longitude:
              allActivities.length > 0 ? allActivities[0].longitude : 0,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {currentDayPlan.activities.map((activity) => (
            <Marker
              key={activity.id}
              coordinate={{
                latitude: activity.latitude,
                longitude: activity.longitude,
              }}
              title={activity.name}
              description={activity.description}
            />
          ))}
        </MapView>

        {/* Weather Overlay */}
        <View style={styles.weatherOverlay}>
          <WeatherWidget
            latitude={allActivities.length > 0 ? allActivities[0].latitude : 0}
            longitude={
              allActivities.length > 0 ? allActivities[0].longitude : 0
            }
            date={currentDayPlan.date}
          />
        </View>
      </View>

      {/* Trip Info Header */}
      <View style={styles.header}>
        <Text style={styles.destination}>{trip.destination}</Text>
        <Text style={styles.budget}>Budget: ${trip.budget}</Text>
      </View>

      {/* Day Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.daySelector}
      >
        {trip.dailyPlans.map((dayPlan, index) => (
          <TouchableOpacity
            key={dayPlan.id}
            style={[
              styles.dayButton,
              selectedDay === index && styles.dayButtonSelected,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay === index && styles.dayButtonTextSelected,
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

      {/* Daily Itinerary */}
      <ScrollView style={styles.itinerary}>
        <View style={styles.costBanner}>
          <Text style={styles.costText}>
            Estimated Cost: ${currentDayPlan.estimatedCost.toFixed(2)}
          </Text>
        </View>

        {/* Activities */}
        {currentDayPlan.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activities</Text>
            {currentDayPlan.activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEdit={() => handleEditActivity(activity)}
                onDelete={() => handleDeleteActivity(activity.id)}
              />
            ))}
          </View>
        )}

        {/* Meals */}
        {currentDayPlan.meals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meals</Text>
            {currentDayPlan.meals.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealType}>{meal.mealType}</Text>
                {meal.cuisine && (
                  <Text style={styles.mealCuisine}>{meal.cuisine}</Text>
                )}
                <Text style={styles.mealCost}>${meal.cost.toFixed(2)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Transportation */}
        {currentDayPlan.transportations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transportation</Text>
            {currentDayPlan.transportations.map((transport) => (
              <View key={transport.id} style={styles.transportCard}>
                <Text style={styles.transportMode}>{transport.mode}</Text>
                <Text style={styles.transportRoute}>
                  {transport.fromLocation} → {transport.toLocation}
                </Text>
                <Text style={styles.transportDuration}>
                  {transport.duration} min
                </Text>
                <Text style={styles.transportCost}>
                  ${transport.cost.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
  },
  refreshButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  mapContainer: {
    height: 250,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  weatherOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  destination: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  budget: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  daySelector: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dayButton: {
    padding: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  dayButtonSelected: {
    borderBottomColor: "#007AFF",
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  dayButtonTextSelected: {
    color: "#007AFF",
  },
  dayDate: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  dayDateSelected: {
    color: "#007AFF",
  },
  itinerary: {
    flex: 1,
  },
  costBanner: {
    backgroundColor: "#34C759",
    padding: 12,
    alignItems: "center",
  },
  costText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  mealType: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    textTransform: "capitalize",
  },
  mealCuisine: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  mealCost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34C759",
    marginTop: 4,
  },
  transportCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  transportMode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textTransform: "capitalize",
  },
  transportRoute: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  transportDuration: {
    fontSize: 14,
    color: "#999",
    marginTop: 2,
  },
  transportCost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34C759",
    marginTop: 4,
  },
});
