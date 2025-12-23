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

interface TermsOfServiceScreenProps {
  navigation: any;
}

export default function TermsOfServiceScreen({ navigation }: TermsOfServiceScreenProps) {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>Last Updated: December 23, 2025</Text>

          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using TravelJoy ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use the App.
          </Text>

          <Text style={styles.sectionTitle}>2. Description of Service</Text>
          <Text style={styles.paragraph}>
            TravelJoy provides users with access to travel planning tools, destination information, hotel and flight search capabilities, and AI-powered trip planning features. The service is provided "as is" and we reserve the right to modify or discontinue the service at any time.
          </Text>

          <Text style={styles.sectionTitle}>3. User Accounts</Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </Text>

          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            You agree not to use the App for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service. You shall not attempt to gain unauthorized access to any portion of the App or any other systems or networks connected to the App.
          </Text>

          <Text style={styles.sectionTitle}>5. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content included in the App, such as text, graphics, logos, images, and software, is the property of TravelJoy or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works from any content without express written permission.
          </Text>

          <Text style={styles.sectionTitle}>6. Third-Party Services</Text>
          <Text style={styles.paragraph}>
            The App may contain links to third-party websites or services that are not owned or controlled by TravelJoy. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </Text>

          <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            TravelJoy shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service. This includes but is not limited to damages for loss of profits, data, or other intangible losses.
          </Text>

          <Text style={styles.sectionTitle}>8. Disclaimer of Warranties</Text>
          <Text style={styles.paragraph}>
            The service is provided on an "as is" and "as available" basis. TravelJoy makes no warranties, expressed or implied, regarding the operation of the service or the information, content, or materials included in the App.
          </Text>

          <Text style={styles.sectionTitle}>9. Booking and Payments</Text>
          <Text style={styles.paragraph}>
            Any bookings made through the App are subject to availability and confirmation. Prices displayed are subject to change without notice. You are responsible for reviewing and agreeing to the terms and conditions of any third-party service providers.
          </Text>

          <Text style={styles.sectionTitle}>10. Modifications to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the new terms on the App. Your continued use of the service after such modifications constitutes your acceptance of the updated terms.
          </Text>

          <Text style={styles.sectionTitle}>11. Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service.
          </Text>

          <Text style={styles.sectionTitle}>12. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which TravelJoy operates, without regard to its conflict of law provisions.
          </Text>

          <Text style={styles.sectionTitle}>13. Contact Information</Text>
          <Text style={styles.paragraph}>
            If you have any questions about these Terms of Service, please contact us at:
          </Text>
          <Text style={styles.contactInfo}>
            Email: support@traveljoy.com{'\n'}
            Address: 123 Travel Street, Adventure City, AC 12345
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
