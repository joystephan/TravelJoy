import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import { SubscriptionProvider } from "./src/contexts/SubscriptionContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </SubscriptionProvider>
    </AuthProvider>
  );
}
