import "react-native-gesture-handler";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import { WishlistProvider } from "./src/contexts/WishlistContext";
import RootNavigator from "./src/navigation/RootNavigator";

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
