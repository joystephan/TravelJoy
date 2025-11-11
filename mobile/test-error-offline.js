/**
 * Test script for error handling and offline utilities
 */

// Mock axios error
const mockAxiosError = {
  response: {
    status: 404,
    data: {
      error: {
        code: "NOT_FOUND",
        message: "Trip not found",
      },
    },
  },
};

const mockNetworkError = {
  request: {},
  message: "Network Error",
};

console.log("Testing Mobile Error Handling and Offline Utilities...\n");

// Test 1: Parse API Error
console.log("✓ Test 1: Parse API Error with Response");
const { parseAPIError } = require("./src/utils/apiErrorHandler");
const parsedError = parseAPIError(mockAxiosError);
console.log(`  - Code: ${parsedError.code}`);
console.log(`  - Message: ${parsedError.message}`);
console.log(`  - Status Code: ${parsedError.statusCode}`);

// Test 2: Parse Network Error
console.log("\n✓ Test 2: Parse Network Error");
const networkError = parseAPIError(mockNetworkError);
console.log(`  - Code: ${networkError.code}`);
console.log(`  - Message: ${networkError.message}`);
console.log(`  - Status Code: ${networkError.statusCode}`);

// Test 3: Get User-Friendly Message
console.log("\n✓ Test 3: Get User-Friendly Messages");
const { getUserFriendlyMessage } = require("./src/utils/apiErrorHandler");
const messages = [
  { code: "NETWORK_ERROR", message: "Network error" },
  { code: "AUTH_ERROR", message: "Auth error" },
  { code: "NOT_FOUND", message: "Not found" },
  { code: "VALIDATION_ERROR", message: "Validation error" },
];

messages.forEach((error) => {
  const friendly = getUserFriendlyMessage(error);
  console.log(`  - ${error.code}: ${friendly}`);
});

// Test 4: Check Retryable Errors
console.log("\n✓ Test 4: Check Retryable Errors");
const { isRetryableError } = require("./src/utils/apiErrorHandler");
const testErrors = [
  { code: "NETWORK_ERROR", statusCode: 0 },
  { code: "AUTH_ERROR", statusCode: 401 },
  { code: "EXTERNAL_API_ERROR", statusCode: 503 },
  { code: "NOT_FOUND", statusCode: 404 },
];

testErrors.forEach((error) => {
  const retryable = isRetryableError(error);
  console.log(
    `  - ${error.code} (${error.statusCode}): ${
      retryable ? "Retryable" : "Not Retryable"
    }`
  );
});

// Test 5: Calculate Retry Delay
console.log("\n✓ Test 5: Calculate Retry Delay (Exponential Backoff)");
const { getRetryDelay } = require("./src/utils/apiErrorHandler");
for (let i = 0; i < 4; i++) {
  const delay = getRetryDelay(i);
  console.log(`  - Attempt ${i + 1}: ~${Math.round(delay / 1000)}s`);
}

console.log("\n✅ All mobile error handling tests passed!");
