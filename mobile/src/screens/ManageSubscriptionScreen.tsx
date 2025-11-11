import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useSubscription } from "../contexts/SubscriptionContext";

const ManageSubscriptionScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { subscriptionStatus, cancelSubscription, loading } = useSubscription();
  const [canceling, setCanceling] = useState(false);

  const handleCancelSubscription = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.",
      [
        {
          text: "No, Keep Subscription",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            if (!subscriptionStatus?.hasSubscription) return;

            setCanceling(true);
            try {
              // Get subscription ID from the subscription status
              // In a real app, you'd store this in the subscription object
              const subscriptionId = "sub_id"; // This should come from subscriptionStatus
              await cancelSubscription(subscriptionId);
              Alert.alert(
                "Subscription Canceled",
                "Your subscription will remain active until the end of the current billing period."
              );
            } catch (error: any) {
              Alert.alert("Error", error.message);
            } finally {
              setCanceling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!subscriptionStatus?.hasSubscription) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Active Subscription</Text>
          <Text style={styles.emptyText}>
            You don't have an active subscription yet.
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

  const { plan, status, currentPeriodEnd, cancelAtPeriodEnd, tripsThisMonth } =
    subscriptionStatus;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Subscription</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Plan</Text>
        <Text style={styles.planName}>{plan?.name}</Text>
        <Text style={styles.planPrice}>
          ${plan?.price.toFixed(2)}/{plan?.interval}
        </Text>

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <View
            style={[
              styles.statusBadge,
              status === "active" && styles.activeBadge,
              status === "trialing" && styles.trialingBadge,
              status === "canceled" && styles.canceledBadge,
            ]}
          >
            <Text style={styles.statusText}>{status?.toUpperCase()}</Text>
          </View>
        </View>

        {currentPeriodEnd && (
          <Text style={styles.infoText}>
            {cancelAtPeriodEnd ? "Expires on: " : "Renews on: "}
            {new Date(currentPeriodEnd).toLocaleDateString()}
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Usage</Text>
        <View style={styles.usageRow}>
          <Text style={styles.usageLabel}>Trips this month:</Text>
          <Text style={styles.usageValue}>
            {tripsThisMonth}
            {plan?.maxTripsPerMonth !== -1 && ` / ${plan?.maxTripsPerMonth}`}
          </Text>
        </View>
        {plan?.maxTripsPerMonth === -1 && (
          <Text style={styles.unlimitedText}>✨ Unlimited trips</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Features</Text>
        {plan?.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actionsContainer}>
        {!cancelAtPeriodEnd && status !== "canceled" && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate("Subscription")}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
          </TouchableOpacity>
        )}

        {!cancelAtPeriodEnd && status !== "canceled" && (
          <TouchableOpacity
            style={[styles.cancelButton, canceling && styles.disabledButton]}
            onPress={handleCancelSubscription}
            disabled={canceling}
          >
            {canceling ? (
              <ActivityIndicator color="#d32f2f" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            )}
          </TouchableOpacity>
        )}

        {cancelAtPeriodEnd && (
          <View style={styles.canceledNotice}>
            <Text style={styles.canceledNoticeText}>
              Your subscription is set to cancel at the end of the billing
              period. You can resubscribe anytime.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 20,
    color: "#007AFF",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#e0e0e0",
  },
  activeBadge: {
    backgroundColor: "#4CAF50",
  },
  trialingBadge: {
    backgroundColor: "#2196F3",
  },
  canceledBadge: {
    backgroundColor: "#f44336",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  usageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 14,
    color: "#666",
  },
  usageValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  unlimitedText: {
    fontSize: 14,
    color: "#4CAF50",
    fontStyle: "italic",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkmark: {
    fontSize: 16,
    color: "#4CAF50",
    marginRight: 8,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  actionsContainer: {
    padding: 16,
  },
  upgradeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d32f2f",
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#d32f2f",
  },
  canceledNotice: {
    backgroundColor: "#fff3cd",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  canceledNoticeText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  subscribeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ManageSubscriptionScreen;
