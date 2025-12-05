import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { colors, spacing, typography } from "../theme";

interface TermsOfServiceScreenProps {
  navigation: any;
}

export default function TermsOfServiceScreen({
  navigation,
}: TermsOfServiceScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Terms of Service</Text>
          <Text style={styles.lastUpdated}>Last updated: January 2024</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.sectionText}>
              By accessing and using TravelJoy, you accept and agree to be bound
              by the terms and provision of this agreement. If you do not agree
              to abide by the above, please do not use this service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Use License</Text>
            <Text style={styles.sectionText}>
              Permission is granted to temporarily use TravelJoy for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may
              not:
            </Text>
            <Text style={styles.bulletPoint}>
              • Modify or copy the materials
            </Text>
            <Text style={styles.bulletPoint}>
              • Use the materials for any commercial purpose
            </Text>
            <Text style={styles.bulletPoint}>
              • Attempt to decompile or reverse engineer any software
            </Text>
            <Text style={styles.bulletPoint}>
              • Remove any copyright or other proprietary notations
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. User Accounts</Text>
            <Text style={styles.sectionText}>
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for all
              activities that occur under your account or password.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Service Availability</Text>
            <Text style={styles.sectionText}>
              We strive to provide continuous access to our service, but we do
              not guarantee that the service will be available at all times. We
              reserve the right to modify, suspend, or discontinue the service
              at any time without notice.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. AI-Generated Content</Text>
            <Text style={styles.sectionText}>
              TravelJoy uses artificial intelligence to generate travel
              itineraries and recommendations. While we strive for accuracy, we
              cannot guarantee that all suggestions will be perfect or suitable
              for your needs. Always verify important information independently.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
            <Text style={styles.sectionText}>
              In no event shall TravelJoy or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on TravelJoy's service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Revisions</Text>
            <Text style={styles.sectionText}>
              TravelJoy may revise these terms of service at any time without
              notice. By using this service you are agreeing to be bound by the
              then current version of these terms of service.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Contact Information</Text>
            <Text style={styles.sectionText}>
              If you have any questions about these Terms of Service, please
              contact us at support@traveljoy.com
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  lastUpdated: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: "600",
  },
  sectionText: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 24,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

