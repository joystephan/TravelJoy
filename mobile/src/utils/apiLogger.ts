/**
 * API Logger utility
 * Centralized logging for API requests and responses
 */

interface LogOptions {
  skipOptionalEndpoints?: boolean;
}

export const apiLogger = {
  /**
   * Log API request details
   */
  logRequest(method: string, url: string, fullUrl: string, headers: any, data: any) {
    console.log("=== API REQUEST ===");
    console.log("Method:", method);
    console.log("URL:", url);
    console.log("Full URL:", fullUrl);
    console.log("Headers:", JSON.stringify(headers, null, 2));
    console.log("Data:", JSON.stringify(data, null, 2));
    console.log("==================");
  },

  /**
   * Log API error details
   */
  logError(
    error: any,
    url?: string,
    method?: string,
    baseUrl?: string,
    options: LogOptions = {}
  ) {
    const isOptionalEndpoint =
      url?.includes("/weather") || url?.includes("/hotels");
    const is404 = error.response?.status === 404;
    const is401 = error.response?.status === 401;

    // Skip logging for optional endpoints with 404 errors
    if (options.skipOptionalEndpoints && isOptionalEndpoint && is404) {
      return;
    }

    // Minimal logging for auth errors
    if (is401) {
      console.warn("Authentication failed:", url);
      return;
    }

    if (error.response) {
      // Server responded with error status
      console.error("=== API ERROR (Server Response) ===");
      console.error("Status:", error.response.status);
      console.error("Status Text:", error.response.statusText);
      console.error("URL:", method?.toUpperCase(), url);
      console.error("Full URL:", `${baseUrl}${url}`);
      console.error(
        "Response Headers:",
        JSON.stringify(error.response.headers, null, 2)
      );
      console.error(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2)
      );
      console.error("Error Message:", error.message);
      console.error("===================================");
    } else if (error.request) {
      // Request made but no response received
      if (!options.skipOptionalEndpoints || !isOptionalEndpoint) {
        console.error("❌ === NETWORK ERROR (No Response) ===");
        console.error("🔗 URL:", method?.toUpperCase(), url);
        console.error("🌐 Full URL:", `${baseUrl}${url}`);
        console.error("📍 Base URL:", baseUrl);
        console.error("⚠️  This usually means:");
        console.error("   1. Backend server is not running");
        console.error("   2. Wrong API URL (localhost won't work on physical devices)");
        console.error("   3. Network/firewall blocking the connection");
        console.error("💡 Solution: Set EXPO_PUBLIC_API_URL in .env to your computer's IP");
        console.error("   Example: EXPO_PUBLIC_API_URL=http://192.168.16.108:3000");
        console.error("Error Code:", error.code);
        console.error("Error Message:", error.message);
        console.error("===================================");
      }
    } else {
      // Error setting up the request
      console.error("=== REQUEST SETUP ERROR ===");
      console.error("Error Message:", error.message);
      console.error("Error Stack:", error.stack);
      console.error("==========================");
    }
  },

  /**
   * Log retry attempt
   */
  logRetry(url: string, attempt: number, maxRetries: number) {
    console.log(`Retrying request (attempt ${attempt}/${maxRetries}): ${url}`);
  },

  /**
   * Log final failure
   */
  logFinalFailure(url: string, method: string, error: any) {
    console.warn("Request failed:", {
      url,
      method,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    });
  },
};

