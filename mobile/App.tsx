import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import { SubscriptionProvider } from "./src/contexts/SubscriptionContext";
import RootNavigator from "./src/navigation/RootNavigator";
import ErrorBoundary from "./src/components/ErrorBoundary";
import { initializeNetworkMonitoring } from "./src/utils/networkStatus";

export default function App() {
  useEffect(() => {
    // Initialize network monitoring
    const unsubscribe = initializeNetworkMonitoring();

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
