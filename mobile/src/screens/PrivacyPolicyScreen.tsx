import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { colors, spacing, typography } from "../theme";

interface PrivacyPolicyScreenProps {
  navigation: any;
}

export default function PrivacyPolicyScreen({
  navigation,
}: PrivacyPolicyScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated: January 2024</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Introduction</Text>
            <Text style={styles.sectionText}>
              TravelJoy ("we", "our", or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our mobile
              application.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Information We Collect</Text>
            <Text style={styles.sectionText}>
              We collect information that you provide directly to us, including:
            </Text>
            <Text style={styles.bulletPoint}>
              • Account information (email, name)
            </Text>
            <Text style={styles.bulletPoint}>
              • Travel preferences and trip data
            </Text>
            <Text style={styles.bulletPoint}>
              • Location data (if you enable location services)
            </Text>
            <Text style={styles.bulletPoint}>
              • Usage data and app interactions
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
            <Text style={styles.sectionText}>
              We use the information we collect to:
            </Text>
            <Text style={styles.bulletPoint}>
              • Provide, maintain, and improve our services
            </Text>
            <Text style={styles.bulletPoint}>
              • Generate personalized travel itineraries
            </Text>
            <Text style={styles.bulletPoint}>
              • Send you updates and notifications about your trips
            </Text>
            <Text style={styles.bulletPoint}>
              • Respond to your comments and questions
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
            <Text style={styles.sectionText}>
              We implement appropriate technical and organizational security
              measures to protect your personal information. However, no method
              of transmission over the internet or electronic storage is 100%
              secure, and we cannot guarantee absolute security.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
            <Text style={styles.sectionText}>
              Our service may contain links to third-party websites or services.
              We are not responsible for the privacy practices of these
              third-party services. We encourage you to read their privacy
              policies.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Your Rights</Text>
            <Text style={styles.sectionText}>
              You have the right to:
            </Text>
            <Text style={styles.bulletPoint}>
              • Access your personal information
            </Text>
            <Text style={styles.bulletPoint}>
              • Correct inaccurate information
            </Text>
            <Text style={styles.bulletPoint}>
              • Request deletion of your data
            </Text>
            <Text style={styles.bulletPoint}>
              • Opt-out of certain data collection
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
            <Text style={styles.sectionText}>
              Our service is not intended for children under the age of 13. We
              do not knowingly collect personal information from children under
              13. If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
            <Text style={styles.sectionText}>
              We may update our Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy on
              this page and updating the "Last updated" date.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Contact Us</Text>
            <Text style={styles.sectionText}>
              If you have any questions about this Privacy Policy, please
              contact us at:
            </Text>
            <Text style={styles.contactInfo}>Email: privacy@traveljoy.com</Text>
            <Text style={styles.contactInfo}>Support: support@traveljoy.com</Text>
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
  contactInfo: {
    ...typography.body1,
    color: colors.primary,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

