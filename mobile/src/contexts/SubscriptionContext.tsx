import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import subscriptionService, {
  SubscriptionPlan,
  SubscriptionStatus,
} from "../services/subscriptionService";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  plans: SubscriptionPlan[];
  loading: boolean;
  error: string | null;
  refreshSubscriptionStatus: () => Promise<void>;
  subscribeToPlan: (planId: string, paymentMethodId?: string) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatus | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize callbacks to prevent unnecessary re-renders
  const loadPlans = useCallback(async () => {
    try {
      const fetchedPlans = await subscriptionService.getPlans();
      setPlans(fetchedPlans);
    } catch (err: any) {
      console.error("Failed to load plans:", err);
    }
  }, []);

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user) {
      setSubscriptionStatus(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const status = await subscriptionService.getSubscriptionStatus();
      setSubscriptionStatus(status);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to fetch subscription status:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const subscribeToPlan = useCallback(
    async (planId: string, paymentMethodId?: string) => {
      setLoading(true);
      setError(null);

      try {
        await subscriptionService.createSubscription(planId, paymentMethodId);
        await refreshSubscriptionStatus();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshSubscriptionStatus]
  );

  const cancelSubscription = useCallback(
    async (subscriptionId: string) => {
      setLoading(true);
      setError(null);

      try {
        await subscriptionService.cancelSubscription(subscriptionId);
        await refreshSubscriptionStatus();
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshSubscriptionStatus]
  );

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (user) {
      refreshSubscriptionStatus();
    }
  }, [user, refreshSubscriptionStatus]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      subscriptionStatus,
      plans,
      loading,
      error,
      refreshSubscriptionStatus,
      subscribeToPlan,
      cancelSubscription,
    }),
    [
      subscriptionStatus,
      plans,
      loading,
      error,
      refreshSubscriptionStatus,
      subscribeToPlan,
      cancelSubscription,
    ]
  );

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};
