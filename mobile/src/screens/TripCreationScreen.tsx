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
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const { colors, mode } = useTheme();
  const [destination, setDestination] = useState(route?.params?.destination || "");
  const [budget, setBudget] = useState(1000);
  const [budgetInput, setBudgetInput] = useState("1000"); // Separate state for input text
  
  // Date states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startDateObj, setStartDateObj] = useState<Date>(new Date());
  const [endDateObj, setEndDateObj] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 7 days from now
    return date;
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
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

  // Initialize date strings from date objects
  useEffect(() => {
    if (!startDate) {
      setStartDate(formatDateToString(startDateObj));
    }
    if (!endDate) {
      setEndDate(formatDateToString(endDateObj));
    }
  }, []);

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

  // Format date to YYYY-MM-DD string
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Format date for display (e.g., "Dec 25, 2026")
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle start date picker
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      setStartDateObj(selectedDate);
      setStartDate(formatDateToString(selectedDate));
      // If end date is before or equal to new start date, update end date
      if (endDateObj <= selectedDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setDate(newEndDate.getDate() + 1);
        setEndDateObj(newEndDate);
        setEndDate(formatDateToString(newEndDate));
      }
    }
    if (Platform.OS === "ios") {
      if (event.type === "dismissed") {
        setShowStartDatePicker(false);
      }
    }
  };

  // Handle end date picker
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      setEndDateObj(selectedDate);
      setEndDate(formatDateToString(selectedDate));
    }
    if (Platform.OS === "ios") {
      if (event.type === "dismissed") {
        setShowEndDatePicker(false);
      }
    }
  };

  const validateDestination = async (): Promise<boolean> => {
    if (!destination.trim()) {
      Alert.alert("Validation Error", "Please enter a destination");
      return false;
    }

    try {
      // Call Nominatim API to validate destination
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destination)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'TravelJoy Mobile App',
          },
        }
      );

      const data = await response.json();

      if (!data || data.length === 0) {
        Alert.alert(
          "Invalid Destination",
          `"${destination}" is not a recognized location.\n\nPlease enter a valid city, country, or landmark.\n\nExamples:\n• Paris, France\n• Tokyo, Japan\n• New York, USA`
        );
        return false;
      }

      console.log('Destination validated:', data[0].display_name);
      return true;
    } catch (error) {
      console.error('Destination validation error:', error);
      // If validation fails due to network, allow it to proceed
      // The backend will do its own validation
      return true;
    }
  };

  const validateForm = () => {
    if (budget < 100) {
      Alert.alert("Validation Error", "Budget must be at least $100");
      return false;
    }
    if (!startDate || !endDate) {
      Alert.alert("Validation Error", "Please select start and end dates");
      return false;
    }

    // Use the date objects directly for validation
    const start = startDateObj;
    const end = endDateObj;
    
    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateOnly = new Date(start);
    startDateOnly.setHours(0, 0, 0, 0);
    
    if (startDateOnly < today) {
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
    // Validate destination first
    const isDestinationValid = await validateDestination();
    if (!isDestinationValid) return;

    // Then validate other fields
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
        "Your trip is being generated! The trip will be ready shortly. You can view it in your trips list.",
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
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
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

          {/* Budget Input */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>💰 Budget</Text>
            <View style={styles.budgetDisplay}>
              <Text style={styles.budgetAmount}>${budget.toLocaleString()}</Text>
              <Text style={styles.budgetLabel}>per trip</Text>
            </View>
            <View style={styles.budgetControls}>
              <TouchableOpacity
                style={styles.budgetButton}
                onPress={() => {
                  const newBudget = Math.max(100, budget - 100);
                  setBudget(newBudget);
                  setBudgetInput(newBudget.toString());
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.budgetButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.budgetInput}
                value={budgetInput}
                onChangeText={(text) => {
                  // Remove all non-numeric characters
                  const cleanText = text.replace(/[^0-9]/g, '');
                  
                  // Update the input text state (allows any input while typing)
                  setBudgetInput(cleanText);
                  
                  // Update the budget number state
                  if (cleanText === '') {
                    setBudget(0);
                  } else {
                    const value = parseInt(cleanText, 10);
                    if (!isNaN(value)) {
                      setBudget(value);
                    }
                  }
                }}
                onBlur={() => {
                  // When user leaves the field, enforce minimum and sync states
                  if (budget < 100) {
                    setBudget(100);
                    setBudgetInput("100");
                  } else {
                    // Sync the input text with the budget value
                    setBudgetInput(budget.toString());
                  }
                }}
                onFocus={() => {
                  // When user focuses, ensure input shows current budget
                  setBudgetInput(budget.toString());
                }}
                keyboardType="number-pad"
                placeholder="Enter budget"
                placeholderTextColor={colors.textLight}
              />
              <TouchableOpacity
                style={styles.budgetButton}
                onPress={() => {
                  const newBudget = budget + 100;
                  setBudget(newBudget);
                  setBudgetInput(newBudget.toString());
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.budgetButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.budgetHint}>Minimum: $100</Text>
          </View>

          {/* Date Pickers */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>📅 Travel Dates</Text>
            <View style={styles.dateRow}>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>Start Date</Text>
                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => setShowStartDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dateFieldText,
                    !startDate && { color: colors.textLight }
                  ]}>
                    {startDate ? formatDateForDisplay(startDateObj) : "Select start date"}
                  </Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                  <>
                    <DateTimePicker
                      value={startDateObj}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleStartDateChange}
                      minimumDate={new Date()}
                    />
                    {Platform.OS === "ios" && (
                      <View style={styles.iosPickerActions}>
                        <TouchableOpacity
                          style={styles.iosPickerButton}
                          onPress={() => setShowStartDatePicker(false)}
                        >
                          <Text style={styles.iosPickerButtonText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </View>
              <Text style={styles.dateSeparator}>→</Text>
              <View style={styles.dateInput}>
                <Text style={styles.dateLabel}>End Date</Text>
                <TouchableOpacity
                  style={styles.dateField}
                  onPress={() => setShowEndDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dateFieldText,
                    !endDate && { color: colors.textLight }
                  ]}>
                    {endDate ? formatDateForDisplay(endDateObj) : "Select end date"}
                  </Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                  <>
                    <DateTimePicker
                      value={endDateObj}
                      mode="date"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={handleEndDateChange}
                      minimumDate={startDateObj || new Date()}
                    />
                    {Platform.OS === "ios" && (
                      <View style={styles.iosPickerActions}>
                        <TouchableOpacity
                          style={styles.iosPickerButton}
                          onPress={() => setShowEndDatePicker(false)}
                        >
                          <Text style={styles.iosPickerButtonText}>Done</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
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
  budgetInput: {
    flex: 1,
    ...typography.h3,
    color: colors.textPrimary,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    textAlign: 'center',
    fontWeight: '600',
  },
  budgetHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
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
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
    justifyContent: 'center',
    minHeight: 44,
  },
  dateFieldText: {
    ...typography.body2,
    color: colors.textPrimary,
  },
  iosPickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    marginTop: spacing.xs,
  },
  iosPickerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iosPickerButtonText: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
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
