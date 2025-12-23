import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

interface PrivacyPolicyScreenProps {
  navigation: any;
}

export default function PrivacyPolicyScreen({ navigation }: PrivacyPolicyScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: December 23, 2025</Text>

          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to TravelJoy's Privacy Policy. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you use our app and tell you about your privacy rights.
          </Text>

          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect several types of information from and about users of our App, including:
          </Text>
          <Text style={styles.bulletPoint}>
            • Personal identification information (name, email address, phone number)
          </Text>
          <Text style={styles.bulletPoint}>
            • Account credentials and authentication information
          </Text>
          <Text style={styles.bulletPoint}>
            • Travel preferences and search history
          </Text>
          <Text style={styles.bulletPoint}>
            • Device information and usage data
          </Text>
          <Text style={styles.bulletPoint}>
            • Location data (with your permission)
          </Text>

          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect about you in the following ways:
          </Text>
          <Text style={styles.bulletPoint}>
            • To provide, maintain, and improve our services
          </Text>
          <Text style={styles.bulletPoint}>
            • To personalize your experience and deliver content relevant to your interests
          </Text>
          <Text style={styles.bulletPoint}>
            • To process your transactions and send related information
          </Text>
          <Text style={styles.bulletPoint}>
            • To send you technical notices, updates, and support messages
          </Text>
          <Text style={styles.bulletPoint}>
            • To respond to your comments, questions, and customer service requests
          </Text>

          <Text style={styles.sectionTitle}>4. Data Sharing and Disclosure</Text>
          <Text style={styles.paragraph}>
            We may share your information in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>
            • With third-party service providers who perform services on our behalf
          </Text>
          <Text style={styles.bulletPoint}>
            • With travel service providers to facilitate your bookings
          </Text>
          <Text style={styles.bulletPoint}>
            • When required by law or to protect our rights
          </Text>
          <Text style={styles.bulletPoint}>
            • With your consent or at your direction
          </Text>

          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the internet is 100% secure.
          </Text>

          <Text style={styles.sectionTitle}>6. Data Retention</Text>
          <Text style={styles.paragraph}>
            We will retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, accounting, or reporting requirements.
          </Text>

          <Text style={styles.sectionTitle}>7. Your Privacy Rights</Text>
          <Text style={styles.paragraph}>
            Depending on your location, you may have the following rights:
          </Text>
          <Text style={styles.bulletPoint}>
            • The right to access your personal data
          </Text>
          <Text style={styles.bulletPoint}>
            • The right to correct inaccurate data
          </Text>
          <Text style={styles.bulletPoint}>
            • The right to request deletion of your data
          </Text>
          <Text style={styles.bulletPoint}>
            • The right to object to or restrict processing
          </Text>
          <Text style={styles.bulletPoint}>
            • The right to data portability
          </Text>

          <Text style={styles.sectionTitle}>8. Cookies and Tracking Technologies</Text>
          <Text style={styles.paragraph}>
            We use cookies and similar tracking technologies to track activity on our App and hold certain information. You can instruct your device to refuse all cookies or to indicate when a cookie is being sent.
          </Text>

          <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our App is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal data, please contact us.
          </Text>

          <Text style={styles.sectionTitle}>10. International Data Transfers</Text>
          <Text style={styles.paragraph}>
            Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
          </Text>

          <Text style={styles.sectionTitle}>11. Changes to This Privacy Policy</Text>
          <Text style={styles.paragraph}>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </Text>

          <Text style={styles.sectionTitle}>12. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please contact us:
          </Text>
          <Text style={styles.contactInfo}>
            Email: privacy@traveljoy.com{'\n'}
            Address: 123 Travel Street, Adventure City, AC 12345{'\n'}
            Phone: +1 (555) 123-4567
          </Text>

          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  lastUpdated: {
    ...typography.body2,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  paragraph: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  bulletPoint: {
    ...typography.body1,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.xs,
    paddingLeft: spacing.md,
  },
  contactInfo: {
    ...typography.body1,
    color: colors.primary,
    lineHeight: 24,
    marginBottom: spacing.md,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});
