import api from "./api";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  maxTripsPerMonth: number;
  stripePriceId: string;
}

export interface SubscriptionStatus {
  hasSubscription: boolean;
  status: string | null;
  plan: SubscriptionPlan | null;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  canCreateTrip: boolean;
  tripsThisMonth: number;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  subscription: any;
  clientSecret?: string;
  message?: string;
}

class SubscriptionService {
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await api.get("/subscription/plans");
      return response.data.plans;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch plans");
    }
  }

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      const response = await api.get("/subscription/status");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch subscription status"
      );
    }
  }

  async createSubscription(
    planId: string,
    paymentMethodId?: string
  ): Promise<CreateSubscriptionResponse> {
    try {
      const response = await api.post("/subscription/subscribe", {
        planId,
        paymentMethodId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create subscription"
      );
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await api.post(`/subscription/cancel/${subscriptionId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    }
  }

  async createPaymentIntent(planId: string): Promise<string> {
    try {
      const response = await api.post("/subscription/create-payment-intent", {
        planId,
      });
      return response.data.clientSecret;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to create payment intent"
      );
    }
  }
}

export default new SubscriptionService();
