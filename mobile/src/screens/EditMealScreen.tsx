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
import { typography, spacing, borderRadius, shadows } from "../theme";
import { useTheme } from "../contexts/ThemeContext";

interface EditMealScreenProps {
  route: any;
  navigation: any;
}

export default function EditMealScreen({
  route,
  navigation,
}: EditMealScreenProps) {
  const { colors } = useTheme();
  const { meal, onSave } = route.params;

  const [name, setName] = useState(meal.name);
  const [description, setDescription] = useState(meal.description || "");
  const [cost, setCost] = useState(meal.cost.toString());
  const [mealType, setMealType] = useState(meal.mealType);
  const [cuisine, setCuisine] = useState(meal.cuisine || "");
  const [loading, setLoading] = useState(false);

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

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
      console.log('Updating meal:', meal.id, 'with cost:', parseFloat(cost));
      
      const updatedMeal = await tripService.updateMeal(meal.id, {
        name,
        description,
        cost: parseFloat(cost),
        mealType,
        cuisine,
      });

      console.log('Meal update response:', updatedMeal);

      // Small delay to ensure database transaction completes
      await new Promise(resolve => setTimeout(resolve, 100));

      // Trigger the refresh callback before navigating back
      if (onSave) {
        console.log('Calling onSave callback to refresh trip data');
        await onSave();
      }

      // Navigate back
      navigation.goBack();
      
      Alert.alert("Success", "Meal updated successfully");
    } catch (error: any) {
      console.error('Failed to update meal:', error);
      Alert.alert("Error", error.message || "Failed to update meal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent={false}
      />
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Meal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Meal Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={name}
              onChangeText={setName}
              placeholder="Enter meal name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter meal description"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Cost ($) *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={cost}
              onChangeText={setCost}
              placeholder="Enter cost"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Meal Type *
            </Text>
            <View style={styles.categoryGrid}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor:
                        mealType === type ? colors.primary : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setMealType(type)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: mealType === type ? "#FFFFFF" : colors.text,
                      },
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Cuisine</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={cuisine}
              onChangeText={setCuisine}
              placeholder="e.g., Italian, Japanese, Mexican"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: colors.primary },
              loading && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...shadows.small,
  },
  backButton: {
    padding: spacing.xs,
  },
  backButtonText: {
    fontSize: 28,
    color: "#FFFFFF",
  },
  headerTitle: {
    ...typography.h1,
    color: "#FFFFFF",
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  form: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body1,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    minWidth: 100,
    alignItems: "center",
  },
  categoryButtonText: {
    ...typography.body2,
  },
  saveButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    marginTop: spacing.lg,
    ...shadows.small,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    ...typography.button,
  },
});
