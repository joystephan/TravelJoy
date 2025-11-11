/**
 * Connection Test Utility
 * Verifies frontend-backend connectivity and API endpoints
 */

import api from "../services/api";

export interface ConnectionTestResult {
  endpoint: string;
  success: boolean;
  message: string;
  responseTime?: number;
}

export class ConnectionTester {
  private results: ConnectionTestResult[] = [];

  async testHealthEndpoint(): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    try {
      const response = await api.get("/health");
      const responseTime = Date.now() - startTime;

      const result: ConnectionTestResult = {
        endpoint: "/health",
        success: response.status === 200,
        message: response.data?.message || "Health check passed",
        responseTime,
      };

      this.results.push(result);
      return result;
    } catch (error: any) {
      const result: ConnectionTestResult = {
        endpoint: "/health",
        success: false,
        message: error.message || "Health check failed",
        responseTime: Date.now() - startTime,
      };

      this.results.push(result);
      return result;
    }
  }

  async testAuthEndpoints(): Promise<ConnectionTestResult[]> {
    const endpoints = [
      { method: "POST", path: "/api/auth/register", requiresAuth: false },
      { method: "POST", path: "/api/auth/login", requiresAuth: false },
    ];

    const results: ConnectionTestResult[] = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        // Just check if endpoint exists (will fail with validation error, not 404)
        await api.request({
          method: endpoint.method,
          url: endpoint.path,
          data: {},
          validateStatus: (status) => status < 500, // Accept any non-server error
        });

        const result: ConnectionTestResult = {
          endpoint: endpoint.path,
          success: true,
          message: "Endpoint accessible",
          responseTime: Date.now() - startTime,
        };

        results.push(result);
        this.results.push(result);
      } catch (error: any) {
        const result: ConnectionTestResult = {
          endpoint: endpoint.path,
          success: false,
          message: error.message || "Endpoint not accessible",
          responseTime: Date.now() - startTime,
        };

        results.push(result);
        this.results.push(result);
      }
    }

    return results;
  }

  async testSubscriptionEndpoints(): Promise<ConnectionTestResult[]> {
    const endpoints = [
      { method: "GET", path: "/api/subscription/plans", requiresAuth: false },
      { method: "GET", path: "/api/subscription/status", requiresAuth: true },
    ];

    const results: ConnectionTestResult[] = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        await api.request({
          method: endpoint.method,
          url: endpoint.path,
          validateStatus: (status) => status < 500,
        });

        const result: ConnectionTestResult = {
          endpoint: endpoint.path,
          success: true,
          message: "Endpoint accessible",
          responseTime: Date.now() - startTime,
        };

        results.push(result);
        this.results.push(result);
      } catch (error: any) {
        const result: ConnectionTestResult = {
          endpoint: endpoint.path,
          success: false,
          message: error.message || "Endpoint not accessible",
          responseTime: Date.now() - startTime,
        };

        results.push(result);
        this.results.push(result);
      }
    }

    return results;
  }

  async testTripEndpoints(): Promise<ConnectionTestResult[]> {
    const endpoints = [
      { method: "GET", path: "/api/trips", requiresAuth: true },
      { method: "POST", path: "/api/trips", requiresAuth: true },
    ];

    const results: ConnectionTestResult[] = [];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      try {
        await api.request({
          method: endpoint.method,
          url: endpoint.path,
          data: endpoint.method === "POST" ? {} : undefined,
          validateStatus: (status) => status < 500,
        });

        const result: ConnectionTestResult = {
          endpoint: endpoint.path,
          success: true,
          message: "Endpoint accessible",
          responseTime: Date.now() - startTime,
        };

        results.push(result);
        this.results.push(result);
      } catch (error: any) {
        const result: ConnectionTestResult = {
          endpoint: endpoint.path,
          success: false,
          message: error.message || "Endpoint not accessible",
          responseTime: Date.now() - startTime,
        };

        results.push(result);
        this.results.push(result);
      }
    }

    return results;
  }

  async runAllTests(): Promise<ConnectionTestResult[]> {
    this.results = [];

    await this.testHealthEndpoint();
    await this.testAuthEndpoints();
    await this.testSubscriptionEndpoints();
    await this.testTripEndpoints();

    return this.results;
  }

  getResults(): ConnectionTestResult[] {
    return this.results;
  }

  getSummary(): {
    total: number;
    passed: number;
    failed: number;
    successRate: number;
  } {
    const total = this.results.length;
    const passed = this.results.filter((r) => r.success).length;
    const failed = total - passed;
    const successRate = total > 0 ? (passed / total) * 100 : 0;

    return { total, passed, failed, successRate };
  }
}

export default new ConnectionTester();
