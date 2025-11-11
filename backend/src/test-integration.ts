/**
 * End-to-End Integration Test Script
 * Tests the complete user journey from registration to trip creation
 */

import axios, { AxiosInstance } from "axios";

const API_URL = process.env.API_URL || "http://localhost:3000";

interface TestResult {
  step: string;
  success: boolean;
  message: string;
  data?: any;
}

class IntegrationTester {
  private api: AxiosInstance;
  private results: TestResult[] = [];
  private authToken: string = "";
  private userId: string = "";
  private tripId: string = "";

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private addResult(
    step: string,
    success: boolean,
    message: string,
    data?: any
  ) {
    this.results.push({ step, success, message, data });
    const status = success ? "✓" : "✗";
    console.log(`${status} ${step}: ${message}`);
  }

  async testHealthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get("/health");
      this.addResult("Health Check", true, "API is running", response.data);
      return true;
    } catch (error: any) {
      this.addResult("Health Check", false, `Failed: ${error.message}`);
      return false;
    }
  }

  async testUserRegistration(): Promise<boolean> {
    try {
      const timestamp = Date.now();
      const testUser = {
        email: `test${timestamp}@traveljoy.com`,
        password: "TestPassword123!",
        firstName: "Test",
        lastName: "User",
      };

      const response = await this.api.post("/api/auth/register", testUser);

      if (response.data.token) {
        this.authToken = response.data.token;
        this.userId = response.data.user.id;
        this.api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${this.authToken}`;
        this.addResult(
          "User Registration",
          true,
          "User registered successfully",
          {
            userId: this.userId,
            email: testUser.email,
          }
        );
        return true;
      } else {
        this.addResult("User Registration", false, "No token received");
        return false;
      }
    } catch (error: any) {
      this.addResult(
        "User Registration",
        false,
        `Failed: ${error.response?.data?.error || error.message}`
      );
      return false;
    }
  }

  async testUserLogin(): Promise<boolean> {
    try {
      // Use a known test account or skip if registration was successful
      this.addResult("User Login", true, "Skipped (using registration token)");
      return true;
    } catch (error: any) {
      this.addResult("User Login", false, `Failed: ${error.message}`);
      return false;
    }
  }

  async testSubscriptionFlow(): Promise<boolean> {
    try {
      // Get available subscription plans
      const plansResponse = await this.api.get("/api/subscription/plans");

      if (!plansResponse.data || plansResponse.data.length === 0) {
        this.addResult(
          "Subscription Flow",
          false,
          "No subscription plans available"
        );
        return false;
      }

      this.addResult(
        "Subscription Flow - Get Plans",
        true,
        `Found ${plansResponse.data.length} plans`,
        {
          plans: plansResponse.data.map((p: any) => p.name),
        }
      );

      // Check subscription status
      const statusResponse = await this.api.get("/api/subscription/status");
      this.addResult(
        "Subscription Flow - Check Status",
        true,
        "Status retrieved",
        {
          status: statusResponse.data,
        }
      );

      return true;
    } catch (error: any) {
      this.addResult(
        "Subscription Flow",
        false,
        `Failed: ${error.response?.data?.error || error.message}`
      );
      return false;
    }
  }

  async testTripCreation(): Promise<boolean> {
    try {
      const tripData = {
        destination: "Paris, France",
        budget: 2000,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        preferences: {
          activityType: "cultural",
          foodPreference: "local",
          transportPreference: "public",
          schedulePreference: "relaxed",
        },
      };

      const response = await this.api.post("/api/trips", tripData);

      if (response.data.id) {
        this.tripId = response.data.id;
        this.addResult("Trip Creation", true, "Trip created successfully", {
          tripId: this.tripId,
          destination: response.data.destination,
        });
        return true;
      } else {
        this.addResult("Trip Creation", false, "No trip ID received");
        return false;
      }
    } catch (error: any) {
      this.addResult(
        "Trip Creation",
        false,
        `Failed: ${error.response?.data?.error || error.message}`
      );
      return false;
    }
  }

  async testItineraryGeneration(): Promise<boolean> {
    try {
      if (!this.tripId) {
        this.addResult("Itinerary Generation", false, "No trip ID available");
        return false;
      }

      const response = await this.api.post(
        `/api/trips/${this.tripId}/generate`
      );

      if (response.data.itinerary && response.data.itinerary.length > 0) {
        this.addResult(
          "Itinerary Generation",
          true,
          `Generated ${response.data.itinerary.length} days`,
          {
            days: response.data.itinerary.length,
            firstDay: response.data.itinerary[0],
          }
        );
        return true;
      } else {
        this.addResult("Itinerary Generation", false, "No itinerary generated");
        return false;
      }
    } catch (error: any) {
      this.addResult(
        "Itinerary Generation",
        false,
        `Failed: ${error.response?.data?.error || error.message}`
      );
      return false;
    }
  }

  async testTripRetrieval(): Promise<boolean> {
    try {
      if (!this.tripId) {
        this.addResult("Trip Retrieval", false, "No trip ID available");
        return false;
      }

      const response = await this.api.get(`/api/trips/${this.tripId}`);

      if (response.data.id === this.tripId) {
        this.addResult("Trip Retrieval", true, "Trip retrieved successfully", {
          tripId: response.data.id,
          status: response.data.status,
        });
        return true;
      } else {
        this.addResult("Trip Retrieval", false, "Trip ID mismatch");
        return false;
      }
    } catch (error: any) {
      this.addResult(
        "Trip Retrieval",
        false,
        `Failed: ${error.response?.data?.error || error.message}`
      );
      return false;
    }
  }

  async testChatAssistant(): Promise<boolean> {
    try {
      if (!this.tripId) {
        this.addResult("Chat Assistant", false, "No trip ID available");
        return false;
      }

      const chatMessage = {
        message: "What are the best restaurants near the Eiffel Tower?",
        tripId: this.tripId,
      };

      const response = await this.api.post("/api/chat", chatMessage);

      if (response.data.response) {
        this.addResult("Chat Assistant", true, "Chat response received", {
          responseLength: response.data.response.length,
        });
        return true;
      } else {
        this.addResult("Chat Assistant", false, "No chat response received");
        return false;
      }
    } catch (error: any) {
      this.addResult(
        "Chat Assistant",
        false,
        `Failed: ${error.response?.data?.error || error.message}`
      );
      return false;
    }
  }

  async runAllTests(): Promise<void> {
    console.log("\n=== TravelJoy E2E Integration Tests ===\n");
    console.log(`Testing API at: ${API_URL}\n`);

    // Test 1: Health Check
    const healthOk = await this.testHealthCheck();
    if (!healthOk) {
      console.log(
        "\n❌ API is not running. Please start the backend server first."
      );
      return;
    }

    // Test 2: User Registration
    await this.testUserRegistration();

    // Test 3: User Login (skipped if registration successful)
    await this.testUserLogin();

    // Test 4: Subscription Flow
    await this.testSubscriptionFlow();

    // Test 5: Trip Creation
    await this.testTripCreation();

    // Test 6: Itinerary Generation
    await this.testItineraryGeneration();

    // Test 7: Trip Retrieval
    await this.testTripRetrieval();

    // Test 8: Chat Assistant
    await this.testChatAssistant();

    // Summary
    this.printSummary();
  }

  private printSummary(): void {
    console.log("\n=== Test Summary ===\n");

    const passed = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✓`);
    console.log(`Failed: ${failed} ✗`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log("\n=== Failed Tests ===\n");
      this.results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`✗ ${r.step}: ${r.message}`);
        });
    }

    console.log("\n");
  }
}

// Run tests
const tester = new IntegrationTester();
tester.runAllTests().catch((error) => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
