import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Switch,
} from "react-native";
import { colors, spacing, borderRadius, shadows, typography } from "../theme";

interface SettingsScreenProps {
  navigation: any;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  showArrow?: boolean;
}

function SettingItem({
  icon,
  title,
  subtitle,
  onPress,
  rightComponent,
  showArrow = true,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIconContainer}>
        <Text style={styles.settingIcon}>{icon}</Text>
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent && <View style={styles.settingRight}>{rightComponent}</View>}
      {showArrow && !rightComponent && (
        <Text style={styles.settingArrow}>→</Text>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationServicesEnabled, setLocationServicesEnabled] = React.useState(true);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Travel Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Preferences</Text>
          <SettingItem
            icon="✈️"
            title="Travel Preferences"
            subtitle="Customize your travel style and preferences"
            onPress={() => navigation.navigate("TravelPreferences")}
          />
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <SettingItem
            icon="👤"
            title="Profile Settings"
            subtitle="Manage your account information"
            onPress={() => navigation.navigate("Profile")}
          />
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <SettingItem
            icon="🔔"
            title="Notifications"
            subtitle="Trip reminders and updates"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
            showArrow={false}
          />
          <SettingItem
            icon="📍"
            title="Location Services"
            subtitle="Use your location for better recommendations"
            rightComponent={
              <Switch
                value={locationServicesEnabled}
                onValueChange={setLocationServicesEnabled}
                trackColor={{ false: colors.gray300, true: colors.primary }}
                thumbColor={colors.white}
              />
            }
            showArrow={false}
          />
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon="❓"
            title="Help & FAQ"
            subtitle="Get answers to common questions"
            onPress={() => navigation.navigate("HelpFAQ")}
          />
          <SettingItem
            icon="📧"
            title="Contact Support"
            subtitle="Get in touch with our team"
            onPress={() => navigation.navigate("ContactSupport")}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem
            icon="ℹ️"
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
          />
          <SettingItem
            icon="📄"
            title="Terms of Service"
            onPress={() => navigation.navigate("TermsOfService")}
          />
          <SettingItem
            icon="🔒"
            title="Privacy Policy"
            onPress={() => navigation.navigate("PrivacyPolicy")}
          />
        </View>

        {/* Bottom spacing */}
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
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontWeight: "600",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  settingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  settingRight: {
    marginLeft: spacing.sm,
  },
  settingArrow: {
    ...typography.h3,
    color: colors.textLight,
    marginLeft: spacing.sm,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

