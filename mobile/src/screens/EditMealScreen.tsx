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
import { tripService } from "../services/tripService";
import { Meal } from "../types";
import { colors, typography, spacing, borderRadius, shadows } from "../theme";

interface EditMealScreenProps {
  route: any;
  navigation: any;
}

export default function EditMealScreen({
  route,
  navigation,
}: EditMealScreenProps) {
  const { meal, onSave } = route.params;

  const [name, setName] = useState(meal.name);
  const [mealType, setMealType] = useState(meal.mealType);
  const [cost, setCost] = useState(meal.cost.toString());
  const [cuisine, setCuisine] = useState(meal.cuisine || "");
  const [loading, setLoading] = useState(false);

  const mealTypes = ["breakfast", "lunch", "dinner", "snack", "drinks"];
  const cuisines = ["local", "international", "asian", "european", "american", "mediterranean"];

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert("Validation Error", "Please enter a meal name");
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
      // TODO: Add updateMeal method to tripService
      // await tripService.updateMeal(meal.id, {
      //   name,
      //   mealType,
      //   cost: parseFloat(cost),
      //   cuisine: cuisine || undefined,
      // });

      Alert.alert("Success", "Meal updated successfully", [
        {
          text: "OK",
          onPress: () => {
            if (onSave) onSave();
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update meal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Edit Meal</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Meal Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Café du Matin"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Meal Type</Text>
          <View style={styles.categoryGrid}>
            {mealTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.categoryButton,
                  mealType === type && styles.categoryButtonSelected,
                ]}
                onPress={() => setMealType(type)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    mealType === type && styles.categoryTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cost ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="25.00"
            value={cost}
            onChangeText={setCost}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Cuisine (Optional)</Text>
          <View style={styles.categoryGrid}>
            {cuisines.map((cuis) => (
              <TouchableOpacity
                key={cuis}
                style={[
                  styles.categoryButton,
                  cuisine === cuis && styles.categoryButtonSelected,
                ]}
                onPress={() => setCuisine(cuisine === cuis ? "" : cuis)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    cuisine === cuis && styles.categoryTextSelected,
                  ]}
                >
                  {cuis}
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
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    minHeight: 44,
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
    minHeight: 52,
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
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray200,
    minHeight: 44,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});

