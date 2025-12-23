import React, { lazy, Suspense } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

// Lazy load screens for better performance
const TripCreationScreen = lazy(() => import("../screens/TripCreationScreen"));
const TripDetailScreen = lazy(() => import("../screens/TripDetailScreen"));
const EditActivityScreen = lazy(() => import("../screens/EditActivityScreen"));
// Import EditMealScreen directly to avoid lazy loading issues
import EditMealScreen from "../screens/EditMealScreen";
const ProfileScreen = lazy(() => import("../screens/ProfileScreen"));
const TravelPreferencesScreen = lazy(
  () => import("../screens/TravelPreferencesScreen")
);
const TripHistoryScreen = lazy(() => import("../screens/TripHistoryScreen"));
const ExploreScreen = lazy(() => import("../screens/ExploreScreen"));
const SettingsScreen = lazy(() => import("../screens/SettingsScreen"));
const WishlistScreen = lazy(() => import("../screens/WishlistScreen"));
const HelpFAQScreen = lazy(() => import("../screens/HelpFAQScreen"));
const ContactSupportScreen = lazy(() => import("../screens/ContactSupportScreen"));
const TermsOfServiceScreen = lazy(() => import("../screens/TermsOfServiceScreen"));
const PrivacyPolicyScreen = lazy(() => import("../screens/PrivacyPolicyScreen"));

// Loading fallback component
const LoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

// HOC to wrap lazy-loaded components with Suspense
const withSuspense = (Component: React.LazyExoticComponent<any>) => {
  return (props: any) => (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
};

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TravelJoy!</Text>
      <Text style={styles.subtitle}>
        Hello, {user?.firstName || user?.email}
      </Text>

      <TouchableOpacity
        style={styles.createTripButton}
        onPress={() => navigation.navigate("CreateTrip")}
      >
        <Text style={styles.createTripButtonText}>Create New Trip</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottomPadding = Math.max(insets.bottom, 8);
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        lazy: true, // Enable lazy loading for tab screens
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingBottom: bottomPadding,
          paddingTop: Platform.OS === 'android' ? 10 : 8,
          height: Platform.OS === 'android' ? 64 + bottomPadding : 60 + bottomPadding,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: -4,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'android' ? 2 : 4,
          marginBottom: Platform.OS === 'android' ? 2 : 0,
        },
      }}
    >
      <Tab.Screen
        name="Explore"
        component={withSuspense(ExploreScreen)}
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🌍</Text>,
        }}
      />
      <Tab.Screen
        name="Trips"
        component={withSuspense(TripHistoryScreen)}
        options={{
          tabBarLabel: "My Trips",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>✈️</Text>,
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={withSuspense(WishlistScreen)}
        options={{
          tabBarLabel: "Wishlist",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>❤️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}


export default function AppNavigator() {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        // Optimize stack navigator performance
        cardStyle: { backgroundColor: colors.background },
        headerStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.gray200,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          color: colors.textPrimary,
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={withSuspense(TripCreationScreen)}
        options={{ title: "Create Trip" }}
      />
      <Stack.Screen
        name="TripDetail"
        component={withSuspense(TripDetailScreen)}
        options={{ title: "Trip Details" }}
      />
      <Stack.Screen
        name="EditActivity"
        component={withSuspense(EditActivityScreen)}
        options={{ title: "Edit Activity" }}
      />
      <Stack.Screen
        name="EditMeal"
        component={EditMealScreen}
        options={{ title: "Edit Meal" }}
      />
      <Stack.Screen
        name="TravelPreferences"
        component={withSuspense(TravelPreferencesScreen)}
        options={{ title: "Travel Preferences" }}
      />
      <Stack.Screen
        name="Settings"
        component={withSuspense(SettingsScreen)}
        options={{ title: "Settings" }}
      />
      <Stack.Screen
        name="Profile"
        component={withSuspense(ProfileScreen)}
        options={{ title: "Profile" }}
      />
      <Stack.Screen
        name="HelpFAQ"
        component={withSuspense(HelpFAQScreen)}
        options={{ title: "Help & FAQ" }}
      />
      <Stack.Screen
        name="ContactSupport"
        component={withSuspense(ContactSupportScreen)}
        options={{ title: "Contact Support" }}
      />
      <Stack.Screen
        name="TermsOfService"
        component={withSuspense(TermsOfServiceScreen)}
        options={{ title: "Terms of Service" }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={withSuspense(PrivacyPolicyScreen)}
        options={{ title: "Privacy Policy" }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 32,
  },
  createTripButton: {
    backgroundColor: "#34C759",
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  createTripButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
