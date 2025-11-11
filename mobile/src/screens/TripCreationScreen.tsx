import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { tripService } from "../services/tripService";
import { TravelPreferences } from "../types";

interface TripCreationScreenProps {
  navigation: any;
}

export default function TripCreationScreen({
  navigation,
}: TripCreationScreenProps) {
  const { user } = useAuth();
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState(1000);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Preferences
  const [activityType, setActivityType] = useState<string[]>([]);
  const [foodPreference, setFoodPreference] = useState<string[]>([]);
  const [transportPreference, setTransportPreference] = useState<string[]>([]);
  const [schedulePreference, setSchedulePreference] = useState<
    "relaxed" | "moderate" | "packed"
  >("moderate");

  const activityOptions = [
    "sightseeing",
    "adventure",
    "cultural",
    "relaxation",
    "shopping",
    "nightlife",
  ];
  const foodOptions = ["local", "international", "vegetarian", "vegan"];
  const transportOptions = ["walking", "public", "taxi", "rental"];

  const toggleSelection = (
    item: string,
    list: string[],
    setter: (list: string[]) => void
  ) => {
    if (list.includes(item)) {
      setter(list.filter((i) => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const validateForm = () => {
    if (!destination.trim()) {
      Alert.alert("Validation Error", "Please enter a destination");
      return false;
    }
    if (budget < 100) {
      Alert.alert("Validation Error", "Budget must be at least $100");
      return false;
    }
    if (!startDate || !endDate) {
      Alert.alert("Validation Error", "Please select start and end dates");
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      Alert.alert("Validation Error", "Please enter valid dates (YYYY-MM-DD)");
      return false;
    }
    if (end <= start) {
      Alert.alert("Validation Error", "End date must be after start date");
      return false;
    }

    return true;
  };

  const handleCreateTrip = async () => {
    if (!validateForm()) return;

    if (!user) {
      Alert.alert("Error", "You must be logged in to create a trip");
      return;
    }

    setLoading(true);
    try {
      const preferences: TravelPreferences = {
        activityType,
        foodPreference,
        transportPreference,
        schedulePreference,
      };

      const trip = await tripService.createTrip({
        userId: user.id,
        destination,
        budget,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        preferences,
      });

      Alert.alert(
        "Success",
        "Your trip is being generated! You'll be notified when it's ready.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.navigate("TripDetail", { tripId: trip.id }),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to create trip. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Plan Your Trip</Text>

        {/* Destination Input */}
        <View style={styles.section}>
          <Text style={styles.label}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Paris, France"
            value={destination}
            onChangeText={setDestination}
            autoCapitalize="words"
          />
        </View>

        {/* Budget Slider */}
        <View style={styles.section}>
          <Text style={styles.label}>Budget: ${budget}</Text>
          <View style={styles.budgetControls}>
            <TouchableOpacity
              style={styles.budgetButton}
              onPress={() => setBudget(Math.max(100, budget - 100))}
            >
              <Text style={styles.budgetButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.budgetValue}>${budget}</Text>
            <TouchableOpacity
              style={styles.budgetButton}
              onPress={() => setBudget(budget + 100)}
            >
              <Text style={styles.budgetButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Pickers */}
        <View style={styles.section}>
          <Text style={styles.label}>Start Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>End Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
          />
        </View>

        {/* Activity Type Preferences */}
        <View style={styles.section}>
          <Text style={styles.label}>Activity Preferences</Text>
          <View style={styles.optionsGrid}>
            {activityOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  activityType.includes(option) && styles.optionButtonSelected,
                ]}
                onPress={() =>
                  toggleSelection(option, activityType, setActivityType)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    activityType.includes(option) && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Food Preferences */}
        <View style={styles.section}>
          <Text style={styles.label}>Food Preferences</Text>
          <View style={styles.optionsGrid}>
            {foodOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  foodPreference.includes(option) &&
                    styles.optionButtonSelected,
                ]}
                onPress={() =>
                  toggleSelection(option, foodPreference, setFoodPreference)
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    foodPreference.includes(option) &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transport Preferences */}
        <View style={styles.section}>
          <Text style={styles.label}>Transport Preferences</Text>
          <View style={styles.optionsGrid}>
            {transportOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  transportPreference.includes(option) &&
                    styles.optionButtonSelected,
                ]}
                onPress={() =>
                  toggleSelection(
                    option,
                    transportPreference,
                    setTransportPreference
                  )
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    transportPreference.includes(option) &&
                      styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Schedule Preference */}
        <View style={styles.section}>
          <Text style={styles.label}>Schedule Pace</Text>
          <View style={styles.scheduleButtons}>
            {(["relaxed", "moderate", "packed"] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.scheduleButton,
                  schedulePreference === option &&
                    styles.scheduleButtonSelected,
                ]}
                onPress={() => setSchedulePreference(option)}
              >
                <Text
                  style={[
                    styles.scheduleText,
                    schedulePreference === option &&
                      styles.scheduleTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleCreateTrip}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Trip</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  budgetControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
  },
  budgetButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  budgetButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginHorizontal: 32,
    minWidth: 100,
    textAlign: "center",
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  optionButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  optionText: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  optionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  scheduleButtons: {
    flexDirection: "row",
    gap: 8,
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  scheduleButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  scheduleText: {
    fontSize: 14,
    color: "#666",
    textTransform: "capitalize",
  },
  scheduleTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: "#999",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
