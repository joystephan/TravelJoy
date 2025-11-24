import React, { lazy, Suspense } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../contexts/AuthContext";

// Lazy load screens for better performance
const SubscriptionScreen = lazy(() => import("../screens/SubscriptionScreen"));
const PaymentScreen = lazy(() => import("../screens/PaymentScreen"));
const ManageSubscriptionScreen = lazy(
  () => import("../screens/ManageSubscriptionScreen")
);
const TripCreationScreen = lazy(() => import("../screens/TripCreationScreen"));
const TripDetailScreen = lazy(() => import("../screens/TripDetailScreen"));
const EditActivityScreen = lazy(() => import("../screens/EditActivityScreen"));
const ProfileScreen = lazy(() => import("../screens/ProfileScreen"));
const TravelPreferencesScreen = lazy(
  () => import("../screens/TravelPreferencesScreen")
);
const TripHistoryScreen = lazy(() => import("../screens/TripHistoryScreen"));
const ExploreScreen = lazy(() => import("../screens/ExploreScreen"));
const SubscriptionGate = lazy(() => import("../components/SubscriptionGate"));

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

      <TouchableOpacity
        style={styles.subscriptionButton}
        onPress={() => navigation.navigate("Subscription")}
      >
        <Text style={styles.subscriptionButtonText}>View Subscriptions</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#50C9C3",
        tabBarInactiveTintColor: "#8E8E93",
        headerShown: false,
        lazy: true, // Enable lazy loading for tab screens
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
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
        name="Profile"
        component={withSuspense(ProfileScreen)}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Wrapper for CreateTrip with subscription gate
const CreateTripWithGate = withSuspense(
  lazy(() =>
    Promise.resolve({
      default: ({ navigation }: any) => (
        <Suspense fallback={<LoadingFallback />}>
          <SubscriptionGate navigation={navigation} feature="trip creation">
            <TripCreationScreen navigation={navigation} />
          </SubscriptionGate>
        </Suspense>
      ),
    })
  )
);

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        // Optimize stack navigator performance
        cardStyle: { backgroundColor: "#fff" },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateTrip"
        component={CreateTripWithGate}
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
        name="Subscription"
        component={withSuspense(SubscriptionScreen)}
        options={{ title: "Choose Your Plan" }}
      />
      <Stack.Screen
        name="Payment"
        component={withSuspense(PaymentScreen)}
        options={{ title: "Payment" }}
      />
      <Stack.Screen
        name="ManageSubscription"
        component={withSuspense(ManageSubscriptionScreen)}
        options={{ title: "Manage Subscription" }}
      />
      <Stack.Screen
        name="TravelPreferences"
        component={withSuspense(TravelPreferencesScreen)}
        options={{ title: "Travel Preferences" }}
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
  subscriptionButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  subscriptionButtonText: {
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
