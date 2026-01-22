import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import { AuthProvider } from "./src/contexts/AuthContext";
import { WishlistProvider } from "./src/contexts/WishlistContext";
import RootNavigator from "./src/navigation/RootNavigator";

// Ignore expected API errors that are handled gracefully (400, 401 client errors)
// These are user errors, not system errors, so they shouldn't trigger error overlays
LogBox.ignoreLogs([
  "Request failed with status code 400",
  "Request failed with status code 401",
  "REGISTRATION_FAILED",
  "AUTHENTICATION_FAILED",
]);

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </WishlistProvider>
    </AuthProvider>
  );
}
