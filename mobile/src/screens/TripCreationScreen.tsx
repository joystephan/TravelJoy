import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { tripService } from "../services/tripService";
import { TravelPreferences } from "../types";
import { spacing, borderRadius, shadows, typography } from "../theme";
import { useTheme } from "../contexts/ThemeContext";
import CategoryChip from "../components/CategoryChip";

interface TripCreationScreenProps {
  navigation: any;
  route?: any;
}

export default function TripCreationScreen({
  navigation,
  route,
}: TripCreationScreenProps) {
  const { colors } = useTheme();
  const [destination, setDestination] = useState(route?.params?.destination || "");
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
    { id: "sightseeing", label: "Sightseeing", icon: "🏛️" },
    { id: "adventure", label: "Adventure", icon: "🏔️" },
    { id: "cultural", label: "Cultural", icon: "🎭" },
    { id: "relaxation", label: "Relaxation", icon: "🧘" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "nightlife", label: "Nightlife", icon: "🎉" },
  ];
  
  const foodOptions = [
    { id: "local", label: "Local", icon: "🧁" },
    { id: "international", label: "International", icon: "🍕" },
    { id: "vegetarian", label: "Vegetarian", icon: "🥗" },
    { id: "vegan", label: "Vegan", icon: "🌱" },
  ];
  
  const transportOptions = [
    { id: "walking", label: "Walking", icon: "🚶" },
    { id: "public", label: "Public", icon: "🚇" },
    { id: "taxi", label: "Taxi", icon: "🚕" },
    { id: "rental", label: "Rental", icon: "🚗" },
  ];

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

    // Try to parse dates - support multiple formats
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime())) {
      Alert.alert("Validation Error", `Invalid start date: "${startDate}"\n\nPlease use format: YYYY-MM-DD\nExample: 2026-12-25`);
      return false;
    }
    
    if (isNaN(end.getTime())) {
      Alert.alert("Validation Error", `Invalid end date: "${endDate}"\n\nPlease use format: YYYY-MM-DD\nExample: 2026-12-31`);
      return false;
    }
    
    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      Alert.alert("Validation Error", "Start date cannot be in the past");
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

    setLoading(true);
    try {
      const preferences: TravelPreferences = {
        activityType,
        foodPreference,
        transportPreference,
        schedulePreference,
      };

      const trip = await tripService.createTrip({
        destination,
        budget,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        preferences,
      });

      Alert.alert(
        "Success! ✨",
        "Your trip is being generated! The itinerary will be ready shortly. You can view it in your trips list.",
        [
          {
            text: "View Trip",
            onPress: () =>
              navigation.navigate("TripDetail", { tripId: trip.id }),
          },
          {
            text: "OK",
            style: "cancel",
          },
        ]
      );
      
      // Navigate to trips list after a short delay
      setTimeout(() => {
        navigation.navigate("MainTabs", { screen: "Trips" });
      }, 2000);
    } catch (error: any) {
      console.error("Create trip error:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to create trip. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.emoji}>✈️</Text>
            <Text style={styles.title}>Plan Your Trip</Text>
            <Text style={styles.subtitle}>
              Tell us about your dream destination
            </Text>
          </View>

          {/* Destination Input */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📍 Where to?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Paris, France"
              placeholderTextColor={colors.textLight}
              value={destination}
              onChangeText={setDestination}
              autoCapitalize="words"
            />
          </View>

          {/* Budget Slider */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💰 Budget</Text>
            <View style={styles.budgetDisplay}>
              <Text style={styles.budgetAmount}>${budget}</Text>
              <Text style={styles.budgetLabel}>per trip</Text>
            </View>
            <View style={styles.budgetControls}>
              <TouchableOpacity
                style={styles.budgetButton}
                onPress={() => setBudget(Math.max(100, budget - 100))}
                activeOpacity={0.7}
              >
                <Text style={styles.budgetButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.budgetSlider}>
                <View
                  style={[
                    styles.budgetSliderFill,
                    { width: `${Math.min((budget / 5000) * 100, 100)}%` },
                  ]}
                />
              </View>
              <TouchableOpacity
                style={styles.budgetButton}
                onPress={() => setBudget(Math.min(5000, budget + 100))}
                activeOpacity={0.7}
              >
                <Text style={styles.budgetButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Pickers */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📅 Travel Dates</Text>
            <Text style={styles.cardHint}>Format: YYYY-MM-DD (e.g., 2026-12-25)</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TextInput
                  style={styles.dateField}
                  placeholder="2026-12-25"
                  placeholderTextColor={colors.textLight}
                  value={startDate}
                  onChangeText={setStartDate}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <Text style={styles.dateSeparator}>→</Text>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TextInput
                  style={styles.dateField}
                  placeholder="2026-12-31"
                  placeholderTextColor={colors.textLight}
                  value={endDate}
                  onChangeText={setEndDate}
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
          </View>

          {/* Activity Preferences */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🎯 Activity Preferences</Text>
            <Text style={styles.cardHint}>Choose what interests you</Text>
            <View style={styles.chipGrid}>
              {activityOptions.map((option) => (
                <CategoryChip
                  key={option.id}
                  label={option.label}
                  icon={option.icon}
                  selected={activityType.includes(option.id)}
                  onPress={() =>
                    toggleSelection(option.id, activityType, setActivityType)
                  }
                  variant="vertical"
                />
              ))}
            </View>
          </View>

          {/* Food Preferences */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🍽️ Food Preferences</Text>
            <Text style={styles.cardHint}>What would you like to eat?</Text>
            <View style={styles.chipGrid}>
              {foodOptions.map((option) => (
                <CategoryChip
                  key={option.id}
                  label={option.label}
                  icon={option.icon}
                  selected={foodPreference.includes(option.id)}
                  onPress={() =>
                    toggleSelection(option.id, foodPreference, setFoodPreference)
                  }
                  variant="vertical"
                />
              ))}
            </View>
          </View>

          {/* Transport Preferences */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>🚗 Transportation</Text>
            <Text style={styles.cardHint}>How do you prefer to get around?</Text>
            <View style={styles.chipGrid}>
              {transportOptions.map((option) => (
                <CategoryChip
                  key={option.id}
                  label={option.label}
                  icon={option.icon}
                  selected={transportPreference.includes(option.id)}
                  onPress={() =>
                    toggleSelection(
                      option.id,
                      transportPreference,
                      setTransportPreference
                    )
                  }
                  variant="vertical"
                />
              ))}
            </View>
          </View>

          {/* Schedule Preference */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>⏰ Schedule Pace</Text>
            <Text style={styles.cardHint}>How packed should your days be?</Text>
            <View style={styles.scheduleButtons}>
              {[
                { id: "relaxed", label: "Relaxed", emoji: "🌸", desc: "Slow & easy" },
                { id: "moderate", label: "Moderate", emoji: "⚖️", desc: "Balanced" },
                { id: "packed", label: "Packed", emoji: "⚡", desc: "Action-packed" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.scheduleButton,
                    schedulePreference === option.id && styles.scheduleButtonSelected,
                  ]}
                  onPress={() => setSchedulePreference(option.id as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.scheduleEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.scheduleLabel,
                      schedulePreference === option.id && styles.scheduleLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.scheduleDesc,
                      schedulePreference === option.id && styles.scheduleDescSelected,
                    ]}
                  >
                    {option.desc}
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
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Create My Trip</Text>
                <Text style={styles.submitButtonIcon}>✨</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles will be created inside component to access theme colors
const createStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.display2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    overflow: 'hidden',
  },
  cardLabel: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontSize: 16,
    fontWeight: '600',
  },
  cardHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  input: {
    ...typography.body1,
    color: colors.textPrimary,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  budgetDisplay: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  budgetAmount: {
    ...typography.display1,
    color: colors.primary,
    fontWeight: '700',
  },
  budgetLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  budgetControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  budgetButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  budgetButtonText: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '600',
  },
  budgetSlider: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  budgetSliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  dateLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dateField: {
    ...typography.body2,
    color: colors.textPrimary,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  dateSeparator: {
    ...typography.h3,
    color: colors.textLight,
    marginTop: 20,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  scheduleButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  scheduleButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  scheduleEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  scheduleLabel: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  scheduleLabelSelected: {
    color: colors.white,
  },
  scheduleDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  scheduleDescSelected: {
    color: colors.white,
    opacity: 0.9,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
    marginRight: spacing.sm,
  },
  submitButtonIcon: {
    fontSize: 20,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
