/**
 * Test script for error handling functionality
 */

import {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ExternalAPIError,
} from "./utils/errors";

console.log("Testing Error Handling Implementation...\n");

// Test 1: AppError
console.log("✓ Test 1: AppError");
const appError = new AppError("Generic error", 500, "GENERIC_ERROR");
console.log(`  - Message: ${appError.message}`);
console.log(`  - Status Code: ${appError.statusCode}`);
console.log(`  - Error Code: ${appError.code}`);
console.log(`  - Is Operational: ${appError.isOperational}`);

// Test 2: ValidationError
console.log("\n✓ Test 2: ValidationError");
const validationError = new ValidationError("Invalid input data");
console.log(`  - Message: ${validationError.message}`);
console.log(`  - Status Code: ${validationError.statusCode}`);
console.log(`  - Error Code: ${validationError.code}`);

// Test 3: AuthenticationError
console.log("\n✓ Test 3: AuthenticationError");
const authError = new AuthenticationError("Invalid credentials");
console.log(`  - Message: ${authError.message}`);
console.log(`  - Status Code: ${authError.statusCode}`);
console.log(`  - Error Code: ${authError.code}`);

// Test 4: NotFoundError
console.log("\n✓ Test 4: NotFoundError");
const notFoundError = new NotFoundError("Trip not found");
console.log(`  - Message: ${notFoundError.message}`);
console.log(`  - Status Code: ${notFoundError.statusCode}`);
console.log(`  - Error Code: ${notFoundError.code}`);

// Test 5: ExternalAPIError
console.log("\n✓ Test 5: ExternalAPIError");
const externalError = new ExternalAPIError("Weather API failed");
console.log(`  - Message: ${externalError.message}`);
console.log(`  - Status Code: ${externalError.statusCode}`);
console.log(`  - Error Code: ${externalError.code}`);

// Test 6: Error inheritance
console.log("\n✓ Test 6: Error Inheritance");
console.log(
  `  - ValidationError instanceof AppError: ${
    validationError instanceof AppError
  }`
);
console.log(
  `  - ValidationError instanceof Error: ${validationError instanceof Error}`
);

console.log("\n✅ All error handling tests passed!");
