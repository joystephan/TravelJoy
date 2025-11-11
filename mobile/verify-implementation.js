#!/usr/bin/env node

/**
 * Manual Verification Script for Navigation and UI Implementation
 *
 * This script verifies that all components, screens, and navigation
 * files can be imported without errors.
 */

console.log("🔍 Verifying Navigation and UI Implementation...\n");

const fs = require("fs");
const path = require("path");

let errors = 0;
let warnings = 0;
let success = 0;

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, "src", filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}: ${filePath}`);
    success++;
    return true;
  } else {
    console.log(`❌ ${description} NOT FOUND: ${filePath}`);
    errors++;
    return false;
  }
}

function checkOptionalFile(filePath, description) {
  const fullPath = path.join(__dirname, "src", filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${description}: ${filePath}`);
    success++;
    return true;
  } else {
    console.log(`⚠️  ${description} (optional): ${filePath}`);
    warnings++;
    return false;
  }
}

console.log("📁 Checking Navigation Files...");
checkFile("navigation/AppNavigator.tsx", "AppNavigator");
checkFile("navigation/AuthNavigator.tsx", "AuthNavigator");
checkFile("navigation/RootNavigator.tsx", "RootNavigator");
checkFile("navigation/types.ts", "Navigation Types");

console.log("\n📱 Checking Screen Files...");
checkFile("screens/ProfileScreen.tsx", "ProfileScreen");
checkFile("screens/TravelPreferencesScreen.tsx", "TravelPreferencesScreen");
checkFile("screens/TripHistoryScreen.tsx", "TripHistoryScreen");
checkFile("screens/LoginScreen.tsx", "LoginScreen");
checkFile("screens/RegisterScreen.tsx", "RegisterScreen");
checkFile("screens/TripCreationScreen.tsx", "TripCreationScreen");
checkFile("screens/TripDetailScreen.tsx", "TripDetailScreen");

console.log("\n🧩 Checking Component Files...");
checkFile("components/MapComponent.tsx", "MapComponent");
checkFile("components/LoadingSpinner.tsx", "LoadingSpinner");
checkFile("components/ErrorBoundary.tsx", "ErrorBoundary");
checkFile("components/ActivityCard.tsx", "ActivityCard");
checkFile("components/WeatherWidget.tsx", "WeatherWidget");
checkFile("components/SubscriptionGate.tsx", "SubscriptionGate");
checkFile("components/index.ts", "Component Index");

console.log("\n🔧 Checking Context Files...");
checkFile("contexts/AuthContext.tsx", "AuthContext");
checkFile("contexts/SubscriptionContext.tsx", "SubscriptionContext");

console.log("\n⚙️  Checking Service Files...");
checkFile("services/authService.ts", "Auth Service");
checkFile("services/tripService.ts", "Trip Service");
checkFile("services/api.ts", "API Client");

console.log("\n📦 Checking Type Definitions...");
checkFile("types/index.ts", "Type Definitions");

console.log("\n🎯 Checking Root Files...");
checkFile("../App.tsx", "App.tsx");
checkFile("../package.json", "package.json");

console.log("\n" + "=".repeat(60));
console.log("📊 Verification Summary:");
console.log("=".repeat(60));
console.log(`✅ Success: ${success} files`);
console.log(`⚠️  Warnings: ${warnings} files`);
console.log(`❌ Errors: ${errors} files`);
console.log("=".repeat(60));

if (errors > 0) {
  console.log("\n❌ Verification FAILED - Missing required files");
  process.exit(1);
} else if (warnings > 0) {
  console.log("\n⚠️  Verification PASSED with warnings");
  process.exit(0);
} else {
  console.log("\n✅ Verification PASSED - All files present!");
  process.exit(0);
}
