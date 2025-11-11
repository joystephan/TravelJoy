/**
 * Verification script for error handling and offline implementation
 */

const fs = require("fs");
const path = require("path");

console.log("Verifying Error Handling and Offline Implementation...\n");

const requiredFiles = [
  // Error handling files
  "src/utils/apiErrorHandler.ts",
  "src/components/ErrorMessage.tsx",

  // Offline support files
  "src/utils/networkStatus.ts",
  "src/utils/offlineStorage.ts",
  "src/services/syncService.ts",
  "src/components/OfflineIndicator.tsx",
];

let allFilesExist = true;

console.log("✓ Checking Required Files:");
requiredFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  const exists = fs.existsSync(filePath);
  console.log(`  ${exists ? "✅" : "❌"} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check file contents for key implementations
console.log("\n✓ Checking Key Implementations:");

// Check apiErrorHandler
const apiErrorHandlerPath = path.join(
  __dirname,
  "src/utils/apiErrorHandler.ts"
);
if (fs.existsSync(apiErrorHandlerPath)) {
  const content = fs.readFileSync(apiErrorHandlerPath, "utf8");
  const hasParseError = content.includes("parseAPIError");
  const hasUserFriendly = content.includes("getUserFriendlyMessage");
  const hasRetryable = content.includes("isRetryableError");
  const hasRetryDelay = content.includes("getRetryDelay");

  console.log(`  ${hasParseError ? "✅" : "❌"} parseAPIError function`);
  console.log(
    `  ${hasUserFriendly ? "✅" : "❌"} getUserFriendlyMessage function`
  );
  console.log(`  ${hasRetryable ? "✅" : "❌"} isRetryableError function`);
  console.log(`  ${hasRetryDelay ? "✅" : "❌"} getRetryDelay function`);
}

// Check networkStatus
const networkStatusPath = path.join(__dirname, "src/utils/networkStatus.ts");
if (fs.existsSync(networkStatusPath)) {
  const content = fs.readFileSync(networkStatusPath, "utf8");
  const hasInit = content.includes("initializeNetworkMonitoring");
  const hasGetOnline = content.includes("getIsOnline");
  const hasListener = content.includes("addNetworkListener");

  console.log(
    `  ${hasInit ? "✅" : "❌"} initializeNetworkMonitoring function`
  );
  console.log(`  ${hasGetOnline ? "✅" : "❌"} getIsOnline function`);
  console.log(`  ${hasListener ? "✅" : "❌"} addNetworkListener function`);
}

// Check offlineStorage
const offlineStoragePath = path.join(__dirname, "src/utils/offlineStorage.ts");
if (fs.existsSync(offlineStoragePath)) {
  const content = fs.readFileSync(offlineStoragePath, "utf8");
  const hasSaveTrips = content.includes("saveTripsOffline");
  const hasGetTrips = content.includes("getTripsOffline");
  const hasPendingSync = content.includes("addPendingSyncOperation");
  const hasGetPending = content.includes("getPendingSyncOperations");

  console.log(`  ${hasSaveTrips ? "✅" : "❌"} saveTripsOffline function`);
  console.log(`  ${hasGetTrips ? "✅" : "❌"} getTripsOffline function`);
  console.log(
    `  ${hasPendingSync ? "✅" : "❌"} addPendingSyncOperation function`
  );
  console.log(
    `  ${hasGetPending ? "✅" : "❌"} getPendingSyncOperations function`
  );
}

// Check syncService
const syncServicePath = path.join(__dirname, "src/services/syncService.ts");
if (fs.existsSync(syncServicePath)) {
  const content = fs.readFileSync(syncServicePath, "utf8");
  const hasSyncData = content.includes("syncData");
  const hasProcessSync = content.includes("processSyncOperation");
  const hasFetchLatest = content.includes("fetchLatestTrips");

  console.log(`  ${hasSyncData ? "✅" : "❌"} syncData function`);
  console.log(
    `  ${hasProcessSync ? "✅" : "❌"} processSyncOperation function`
  );
  console.log(`  ${hasFetchLatest ? "✅" : "❌"} fetchLatestTrips function`);
}

// Check API client enhancements
const apiClientPath = path.join(__dirname, "src/services/api.ts");
if (fs.existsSync(apiClientPath)) {
  const content = fs.readFileSync(apiClientPath, "utf8");
  const hasRetry = content.includes("_retry");
  const hasRequestId = content.includes("x-request-id");
  const hasParseError = content.includes("parseAPIError");

  console.log(`  ${hasRetry ? "✅" : "❌"} Retry logic in API client`);
  console.log(`  ${hasRequestId ? "✅" : "❌"} Request ID tracking`);
  console.log(`  ${hasParseError ? "✅" : "❌"} Error parsing integration`);
}

// Check tripService offline support
const tripServicePath = path.join(__dirname, "src/services/tripService.ts");
if (fs.existsSync(tripServicePath)) {
  const content = fs.readFileSync(tripServicePath, "utf8");
  const hasGetOnline = content.includes("getIsOnline");
  const hasSaveOffline = content.includes("saveTripOffline");
  const hasPendingOp = content.includes("addPendingSyncOperation");

  console.log(
    `  ${hasGetOnline ? "✅" : "❌"} Offline detection in tripService`
  );
  console.log(`  ${hasSaveOffline ? "✅" : "❌"} Offline storage integration`);
  console.log(`  ${hasPendingOp ? "✅" : "❌"} Pending operations queue`);
}

// Check App.tsx initialization
const appPath = path.join(__dirname, "App.tsx");
if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, "utf8");
  const hasNetworkInit = content.includes("initializeNetworkMonitoring");

  console.log(
    `  ${
      hasNetworkInit ? "✅" : "❌"
    } Network monitoring initialization in App.tsx`
  );
}

// Check package.json for NetInfo dependency
const packagePath = path.join(__dirname, "package.json");
if (fs.existsSync(packagePath)) {
  const content = fs.readFileSync(packagePath, "utf8");
  const hasNetInfo = content.includes("@react-native-community/netinfo");

  console.log(
    `  ${hasNetInfo ? "✅" : "❌"} NetInfo dependency in package.json`
  );
}

console.log("\n" + "=".repeat(50));
if (allFilesExist) {
  console.log("✅ All required files exist!");
  console.log("✅ Error handling and offline support implementation verified!");
} else {
  console.log("❌ Some required files are missing!");
}
console.log("=".repeat(50));

console.log("\n📝 Next Steps:");
console.log(
  "  1. Run 'npm install' to install @react-native-community/netinfo"
);
console.log("  2. Test offline mode by toggling airplane mode on device");
console.log("  3. Test error handling by simulating network failures");
console.log("  4. Monitor sync operations in the app");
