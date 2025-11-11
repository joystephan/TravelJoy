import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSubscription } from "../contexts/SubscriptionContext";
import { SubscriptionPlan } from "../services/subscriptionService";

const SubscriptionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { plans, subscriptionStatus, subscribeToPlan, loading } =
    useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (processing) return;

    setSelectedPlan(plan.id);

    // For free trial, subscribe immediately
    if (plan.id === "free_trial") {
      try {
        setProcessing(true);
        await subscribeToPlan(plan.id);
        Alert.alert("Success", "Your free trial has been activated!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (error: any) {
        Alert.alert("Error", error.message);
      } finally {
        setProcessing(false);
      }
    } else {
      // For paid plans, navigate to payment screen
      navigation.navigate("Payment", { plan });
    }
  };

  const handleManageSubscription = () => {
    navigation.navigate("ManageSubscription");
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Start planning your dream trips with TravelJoy
        </Text>
      </View>

      {subscriptionStatus?.hasSubscription && (
        <View style={styles.currentPlanBanner}>
          <Text style={styles.currentPlanText}>
            Current Plan: {subscriptionStatus.plan?.name}
          </Text>
          <TouchableOpacity onPress={handleManageSubscription}>
            <Text style={styles.manageLink}>Manage Subscription</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <View
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.selectedPlanCard,
              plan.id === "premium" && styles.premiumCard,
            ]}
          >
            {plan.id === "premium" && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDescription}>{plan.description}</Text>

            <View style={styles.priceContainer}>
              {plan.price === 0 ? (
                <Text style={styles.priceText}>Free</Text>
              ) : (
                <>
                  <Text style={styles.priceText}>${plan.price.toFixed(2)}</Text>
                  <Text style={styles.priceInterval}>/{plan.interval}</Text>
                </>
              )}
            </View>

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Text style={styles.checkmark}>✓</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.selectButton,
                plan.id === "premium" && styles.premiumButton,
                processing && selectedPlan === plan.id && styles.disabledButton,
              ]}
              onPress={() => handleSelectPlan(plan)}
              disabled={processing && selectedPlan === plan.id}
            >
              {processing && selectedPlan === plan.id ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.selectButtonText}>
                  {plan.id === "free_trial" ? "Start Free Trial" : "Subscribe"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All plans include AI-powered travel planning and 24/7 support
        </Text>
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
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  currentPlanBanner: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  currentPlanText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1976d2",
  },
  manageLink: {
    fontSize: 14,
    color: "#1976d2",
    textDecorationLine: "underline",
  },
  plansContainer: {
    padding: 16,
  },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    position: "relative",
  },
  selectedPlanCard: {
    borderColor: "#007AFF",
  },
  premiumCard: {
    borderColor: "#FFD700",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    right: 20,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  priceText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#007AFF",
  },
  priceInterval: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkmark: {
    fontSize: 18,
    color: "#4CAF50",
    marginRight: 8,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  selectButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  premiumButton: {
    backgroundColor: "#FFD700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});

export default SubscriptionScreen;
