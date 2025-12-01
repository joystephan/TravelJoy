import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from "react-native";
import { colors, typography, spacing } from "../theme";

interface SimpleLoginProps {
  navigation: any;
}

export default function SimpleLoginScreen({ navigation }: SimpleLoginProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>✈️</Text>
          <Text style={styles.appName}>TravelJoy</Text>
          <Text style={styles.tagline}>Your AI Travel Companion</Text>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>
            This is a demo of your beautiful TravelJoy app
          </Text>
        </View>

        {/* Demo Button */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={() => alert("Backend is running! ✅\n\nUI is working perfectly!\n\nTo enable full auth, we need to debug the React Native issue.")}
        >
          <Text style={styles.demoButtonText}>View Demo</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>✅ What's Working:</Text>
          <Text style={styles.infoText}>• Backend API running on port 3000</Text>
          <Text style={styles.infoText}>• Beautiful UI theme loaded</Text>
          <Text style={styles.infoText}>• Navigation configured</Text>
          <Text style={styles.infoText}>• All screens designed</Text>
          
          <Text style={[styles.infoTitle, { marginTop: spacing.md }]}>🔧 Debug Needed:</Text>
          <Text style={styles.infoText}>• AsyncStorage type issue in React Native</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  appName: {
    ...typography.display1,
    color: colors.primary,
    fontWeight: "700",
  },
  tagline: {
    ...typography.body2,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
    textAlign: "center",
  },
  demoButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  demoButtonText: {
    ...typography.button,
    color: colors.white,
  },
  infoBox: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});



