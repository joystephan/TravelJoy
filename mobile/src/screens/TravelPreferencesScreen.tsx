import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const ACTIVITY_TYPES = [
  { id: "cultural", label: "Cultural & Historical", icon: "🏛️" },
  { id: "adventure", label: "Adventure & Outdoor", icon: "🏔️" },
  { id: "relaxation", label: "Relaxation & Wellness", icon: "🧘" },
  { id: "food", label: "Food & Dining", icon: "🍽️" },
  { id: "shopping", label: "Shopping", icon: "🛍️" },
  { id: "nightlife", label: "Nightlife & Entertainment", icon: "🎭" },
  { id: "nature", label: "Nature & Wildlife", icon: "🌿" },
  { id: "beach", label: "Beach & Water Sports", icon: "🏖️" },
];

const FOOD_PREFERENCES = [
  { id: "local", label: "Local Cuisine", icon: "🍜" },
  { id: "international", label: "International", icon: "🌍" },
  { id: "vegetarian", label: "Vegetarian", icon: "🥗" },
  { id: "vegan", label: "Vegan", icon: "🌱" },
  { id: "halal", label: "Halal", icon: "🕌" },
  { id: "kosher", label: "Kosher", icon: "✡️" },
  { id: "fine-dining", label: "Fine Dining", icon: "🍷" },
  { id: "street-food", label: "Street Food", icon: "🌮" },
];

const TRANSPORT_PREFERENCES = [
  { id: "walking", label: "Walking", icon: "🚶" },
  { id: "public", label: "Public Transport", icon: "🚇" },
  { id: "taxi", label: "Taxi/Rideshare", icon: "🚕" },
  { id: "rental", label: "Car Rental", icon: "🚗" },
  { id: "bike", label: "Bicycle", icon: "🚲" },
];

const SCHEDULE_PREFERENCES = [
  {
    id: "relaxed",
    label: "Relaxed",
    description: "Fewer activities, more free time",
  },
  { id: "moderate", label: "Moderate", description: "Balanced schedule" },
  { id: "packed", label: "Packed", description: "Maximum activities per day" },
];

export default function TravelPreferencesScreen({ navigation }: any) {
  const { user, updatePreferences } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activityTypes, setActivityTypes] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [transportPreferences, setTransportPreferences] = useState<string[]>(
    []
  );
  const [schedulePreference, setSchedulePreference] =
    useState<string>("moderate");

  useEffect(() => {
    if (user?.preferences) {
      const prefs = user.preferences;
      setActivityTypes(
        Array.isArray(prefs.activityType)
          ? prefs.activityType
          : prefs.activityType
          ? [prefs.activityType]
          : []
      );
      setFoodPreferences(
        Array.isArray(prefs.foodPreference)
          ? prefs.foodPreference
          : prefs.foodPreference
          ? [prefs.foodPreference]
          : []
      );
      setTransportPreferences(
        Array.isArray(prefs.transportPreference)
          ? prefs.transportPreference
          : prefs.transportPreference
          ? [prefs.transportPreference]
          : []
      );
      setSchedulePreference(prefs.schedulePreference || "moderate");
    }
  }, [user]);

  const toggleSelection = (
    value: string,
    currentValues: string[],
    setter: (values: string[]) => void
  ) => {
    if (currentValues.includes(value)) {
      setter(currentValues.filter((v) => v !== value));
    } else {
      setter([...currentValues, value]);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await updatePreferences({
        activityType: activityTypes,
        foodPreference: foodPreferences,
        transportPreference: transportPreferences,
        schedulePreference,
      });
      Alert.alert("Success", "Travel preferences updated successfully");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Saving preferences..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activity Types</Text>
        <Text style={styles.sectionDescription}>
          Select the types of activities you enjoy (multiple selections allowed)
        </Text>
        <View style={styles.optionsGrid}>
          {ACTIVITY_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.option,
                activityTypes.includes(type.id) && styles.optionSelected,
              ]}
              onPress={() =>
                toggleSelection(type.id, activityTypes, setActivityTypes)
              }
            >
              <Text style={styles.optionIcon}>{type.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  activityTypes.includes(type.id) && styles.optionLabelSelected,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Food Preferences</Text>
        <Text style={styles.sectionDescription}>
          Select your dietary preferences and food interests
        </Text>
        <View style={styles.optionsGrid}>
          {FOOD_PREFERENCES.map((pref) => (
            <TouchableOpacity
              key={pref.id}
              style={[
                styles.option,
                foodPreferences.includes(pref.id) && styles.optionSelected,
              ]}
              onPress={() =>
                toggleSelection(pref.id, foodPreferences, setFoodPreferences)
              }
            >
              <Text style={styles.optionIcon}>{pref.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  foodPreferences.includes(pref.id) &&
                    styles.optionLabelSelected,
                ]}
              >
                {pref.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transport Preferences</Text>
        <Text style={styles.sectionDescription}>
          How do you prefer to get around?
        </Text>
        <View style={styles.optionsGrid}>
          {TRANSPORT_PREFERENCES.map((pref) => (
            <TouchableOpacity
              key={pref.id}
              style={[
                styles.option,
                transportPreferences.includes(pref.id) && styles.optionSelected,
              ]}
              onPress={() =>
                toggleSelection(
                  pref.id,
                  transportPreferences,
                  setTransportPreferences
                )
              }
            >
              <Text style={styles.optionIcon}>{pref.icon}</Text>
              <Text
                style={[
                  styles.optionLabel,
                  transportPreferences.includes(pref.id) &&
                    styles.optionLabelSelected,
                ]}
              >
                {pref.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule Preference</Text>
        <Text style={styles.sectionDescription}>
          How packed do you want your daily schedule?
        </Text>
        {SCHEDULE_PREFERENCES.map((pref) => (
          <TouchableOpacity
            key={pref.id}
            style={[
              styles.scheduleOption,
              schedulePreference === pref.id && styles.scheduleOptionSelected,
            ]}
            onPress={() => setSchedulePreference(pref.id)}
          >
            <View style={styles.scheduleOptionContent}>
              <Text
                style={[
                  styles.scheduleOptionLabel,
                  schedulePreference === pref.id &&
                    styles.scheduleOptionLabelSelected,
                ]}
              >
                {pref.label}
              </Text>
              <Text style={styles.scheduleOptionDescription}>
                {pref.description}
              </Text>
            </View>
            {schedulePreference === pref.id && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>Save Preferences</Text>
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
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  option: {
    backgroundColor: "#f9f9f9",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    minWidth: "30%",
    flexGrow: 1,
  },
  optionSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  optionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  optionLabelSelected: {
    color: "#007AFF",
    fontWeight: "600",
  },
  scheduleOption: {
    backgroundColor: "#f9f9f9",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleOptionSelected: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  scheduleOptionContent: {
    flex: 1,
  },
  scheduleOptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  scheduleOptionLabelSelected: {
    color: "#007AFF",
  },
  scheduleOptionDescription: {
    fontSize: 14,
    color: "#666",
  },
  checkmark: {
    fontSize: 24,
    color: "#007AFF",
    fontWeight: "bold",
  },
  buttonContainer: {
    padding: 24,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
