import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, spacing, borderRadius, shadows, typography } from "../theme";

interface ContactSupportScreenProps {
  navigation: any;
}

export default function ContactSupportScreen({
  navigation,
}: ContactSupportScreenProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert("Validation Error", "Please fill in all required fields");
      return;
    }

    // TODO: Implement actual email sending functionality
    Alert.alert(
      "Message Sent",
      "Thank you for contacting us! We'll get back to you as soon as possible.",
      [
        {
          text: "OK",
          onPress: () => {
            setSubject("");
            setMessage("");
            setEmail("");
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Contact Support</Text>
            <Text style={styles.subtitle}>
              We're here to help! Send us a message and we'll respond as soon
              as possible.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="your.email@example.com"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Subject <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="What can we help you with?"
                placeholderTextColor={colors.textLight}
                value={subject}
                onChangeText={setSubject}
                autoCapitalize="sentences"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Message <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Please describe your issue or question in detail..."
                placeholderTextColor={colors.textLight}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Other Ways to Reach Us</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📧</Text>
              <Text style={styles.infoText}>support@traveljoy.com</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>⏰</Text>
              <Text style={styles.infoText}>
                Response time: Usually within 24 hours
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...typography.body1,
    color: colors.textPrimary,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginTop: spacing.md,
    ...shadows.md,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.white,
  },
  infoSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  infoTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

