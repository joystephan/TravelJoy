import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSubscription } from "../contexts/SubscriptionContext";

interface SubscriptionGateProps {
  children: React.ReactNode;
  navigation: any;
  feature?: string;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  children,
  navigation,
  feature = "this feature",
}) => {
  const { subscriptionStatus, loading } = useSubscription();

  useEffect(() => {
    // Check subscription status when component mounts
    if (!loading && !subscriptionStatus?.hasSubscription) {
      // Optionally redirect to subscription screen
      // navigation.navigate("Subscription");
    }
  }, [loading, subscriptionStatus]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Check if user has an active subscription
  const hasActiveSubscription =
    subscriptionStatus?.hasSubscription &&
    (subscriptionStatus.status === "active" ||
      subscriptionStatus.status === "trialing");

  // Check if user can create trips
  const canCreateTrip = subscriptionStatus?.canCreateTrip || false;

  if (!hasActiveSubscription) {
    return (
      <View style={styles.gateContainer}>
        <View style={styles.gateContent}>
          <Text style={styles.gateIcon}>🔒</Text>
          <Text style={styles.gateTitle}>Subscription Required</Text>
          <Text style={styles.gateText}>
            You need an active subscription to access {feature}.
          </Text>
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => navigation.navigate("Subscription")}
          >
            <Text style={styles.subscribeButtonText}>View Plans</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!canCreateTrip && feature === "trip creation") {
    return (
      <View style={styles.gateContainer}>
        <View style={styles.gateContent}>
          <Text style={styles.gateIcon}>📊</Text>
          <Text style={styles.gateTitle}>Trip Limit Reached</Text>
          <Text style={styles.gateText}>
            You've reached your monthly trip limit of{" "}
            {subscriptionStatus.plan?.maxTripsPerMonth} trips.
          </Text>
          <Text style={styles.gateSubtext}>
            Trips used this month: {subscriptionStatus.tripsThisMonth} /{" "}
            {subscriptionStatus.plan?.maxTripsPerMonth}
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate("Subscription")}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // User has access, render children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  gateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  gateContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  gateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  gateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  gateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  gateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 24,
  },
  subscribeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  upgradeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  backButton: {
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#666",
  },
});

export default SubscriptionGate;
