import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Import screens
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import TripCreationScreen from "./src/screens/TripCreationScreen";
import TripDetailScreen from "./src/screens/TripDetailScreen";
import TripHistoryScreen from "./src/screens/TripHistoryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import TravelPreferencesScreen from "./src/screens/TravelPreferencesScreen";
import HelpFAQScreen from "./src/screens/HelpFAQScreen";
import ContactSupportScreen from "./src/screens/ContactSupportScreen";
import TermsOfServiceScreen from "./src/screens/TermsOfServiceScreen";
import PrivacyPolicyScreen from "./src/screens/PrivacyPolicyScreen";
import EditActivityScreen from "./src/screens/EditActivityScreen";
import EditMealScreen from "./src/screens/EditMealScreen";
import WishlistScreen from "./src/screens/WishlistScreen";
import { colors } from "./src/theme";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { WishlistProvider } from "./src/contexts/WishlistContext";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Inner component that uses useAuth hook (must be inside AuthProvider)
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>✈️</Text>
        <Text style={styles.appName}>TravelJoy</Text>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  // Bottom Tab Navigator for main app screens
  function MainTabs() {
    const insets = useSafeAreaInsets();
    
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 1,
            borderTopColor: colors.gray200,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingTop: 12,
            height: 70 + Math.max(insets.bottom, 12),
            minHeight: 70,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginTop: 4,
            marginBottom: 0,
          },
          tabBarIconStyle: {
            marginTop: 8,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={ExploreScreen}
          options={{
            tabBarLabel: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>
                🏠
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="MyTrips"
          component={TripHistoryScreen}
          options={{
            tabBarLabel: "My Trips",
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: 24, opacity: focused ? 1 : 0.6 }}>
                ✈️
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="Wishlist"
          component={WishlistScreen}
          options={{
            tabBarLabel: "Wishlist",
            tabBarIcon: ({ color, focused }) => (
              <Text style={{ fontSize: 24, color: '#FF3B30' }}>
                ❤️
              </Text>
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.white,
          headerTitleStyle: {
            fontWeight: "700",
          },
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // App Stack
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateTrip"
              component={TripCreationScreen}
              options={{ title: "Create Trip" }}
            />
            <Stack.Screen
              name="TripDetail"
              component={TripDetailScreen}
              options={{
                title: "Trip Details",
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: "Profile" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: "Settings" }}
            />
            <Stack.Screen
              name="TravelPreferences"
              component={TravelPreferencesScreen}
              options={{ title: "Travel Preferences" }}
            />
            <Stack.Screen
              name="HelpFAQ"
              component={HelpFAQScreen}
              options={{ title: "Help & FAQ" }}
            />
            <Stack.Screen
              name="ContactSupport"
              component={ContactSupportScreen}
              options={{ title: "Contact Support" }}
            />
            <Stack.Screen
              name="TermsOfService"
              component={TermsOfServiceScreen}
              options={{ title: "Terms of Service" }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{ title: "Privacy Policy" }}
            />
            <Stack.Screen
              name="EditActivity"
              component={EditActivityScreen}
              options={{ title: "Edit Activity" }}
            />
            <Stack.Screen
              name="EditMeal"
              component={EditMealScreen}
              options={{ title: "Edit Meal" }}
            />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <AppContent />
      </WishlistProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
  },
});
