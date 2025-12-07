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
  StatusBar,
  SafeAreaView,
} from "react-native";
import { tripService } from "../services/tripService";
import { Activity } from "../types";
import { typography, spacing, borderRadius, shadows } from "../theme";
import { useTheme } from "../contexts/ThemeContext";

interface EditActivityScreenProps {
  route: any;
  navigation: any;
}

export default function EditActivityScreen({
  route,
  navigation,
}: EditActivityScreenProps) {
  const { colors } = useTheme();
  const { activity, onSave } = route.params;

  const [name, setName] = useState(activity.name);
  const [description, setDescription] = useState(activity.description || "");
  const [duration, setDuration] = useState(activity.duration.toString());
  const [cost, setCost] = useState(activity.cost.toString());
  const [category, setCategory] = useState(activity.category);
  const [loading, setLoading] = useState(false);

  const categories = [
    "sightseeing",
    "adventure",
    "cultural",
    "relaxation",
    "shopping",
    "nightlife",
    "food",
    "entertainment",
  ];

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter an activity name");
      return false;
    }
    if (isNaN(parseFloat(duration)) || parseFloat(duration) <= 0) {
      Alert.alert("Validation Error", "Please enter a valid duration");
      return false;
    }
    if (isNaN(parseFloat(cost)) || parseFloat(cost) < 0) {
      Alert.alert("Validation Error", "Please enter a valid cost");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await tripService.updateActivity(activity.id, {
        name,
        description,
        duration: parseFloat(duration),
        cost: parseFloat(cost),
        category,
      });

      Alert.alert("Success", "Activity updated successfully", [
        {
          text: "OK",
          onPress: () => {
            if (onSave) onSave();
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update activity");
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={colors.mode === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Edit Activity</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Activity Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Visit Eiffel Tower"
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add details about this activity..."
            placeholderTextColor={colors.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="120"
            placeholderTextColor={colors.textLight}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cost ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="25.00"
            placeholderTextColor={colors.textLight}
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.categoryButtonSelected,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    minHeight: 44, // Professional touch target size
  },
  categoryButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    ...typography.body2,
    color: colors.textSecondary,
    textTransform: "capitalize",
  },
  categoryTextSelected: {
    ...typography.body2,
    color: colors.white,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    minHeight: 52, // Professional button height
    ...shadows.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray200,
    minHeight: 44, // Professional touch target size
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
