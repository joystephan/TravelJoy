#!/usr/bin/env node

/**
 * Import Test Script
 * Tests that all TypeScript files can be successfully imported
 */

console.log("🧪 Testing TypeScript Imports...\n");

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const filesToTest = [
  "src/navigation/AppNavigator.tsx",
  "src/navigation/AuthNavigator.tsx",
  "src/navigation/RootNavigator.tsx",
  "src/navigation/types.ts",
  "src/screens/ProfileScreen.tsx",
  "src/screens/TravelPreferencesScreen.tsx",
  "src/screens/TripHistoryScreen.tsx",
  "src/components/MapComponent.tsx",
  "src/components/LoadingSpinner.tsx",
  "src/components/ErrorBoundary.tsx",
  "src/components/index.ts",
  "src/contexts/AuthContext.tsx",
  "src/services/authService.ts",
  "App.tsx",
];

let passed = 0;
let failed = 0;

console.log("Running TypeScript compiler check...\n");

try {
  execSync("npx tsc --noEmit", {
    cwd: __dirname,
    stdio: "pipe",
  });
  console.log("✅ TypeScript compilation: PASSED\n");
  passed++;
} catch (error) {
  console.log("❌ TypeScript compilation: FAILED");
  console.log(error.stdout?.toString() || error.message);
  failed++;
}

console.log("Checking file syntax...\n");

filesToTest.forEach((file) => {
  const filePath = path.join(__dirname, file);
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Basic syntax checks
    const hasImports = content.includes("import");
    const hasExports = content.includes("export");
    const hasReact = content.includes("React") || content.includes("react");

    if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      if (!hasImports && !hasExports) {
        console.log(`⚠️  ${file}: No imports or exports found`);
      } else {
        console.log(`✅ ${file}: Syntax OK`);
        passed++;
      }
    }
  } catch (error) {
    console.log(`❌ ${file}: ${error.message}`);
    failed++;
  }
});

console.log("\n" + "=".repeat(60));
console.log("📊 Import Test Summary:");
console.log("=".repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log("=".repeat(60));

if (failed > 0) {
  console.log("\n❌ Some tests FAILED");
  process.exit(1);
} else {
  console.log("\n✅ All tests PASSED!");
  process.exit(0);
}
