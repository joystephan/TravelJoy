import axios, { AxiosError, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  parseAPIError,
  isRetryableError,
  getRetryDelay,
} from "../utils/apiErrorHandler";

// Get API URL from environment, with smart defaults
let API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// If no API URL is set, try to detect if we're on a device and use local IP
if (!API_BASE_URL) {
  // For physical devices/emulators, localhost won't work
  // Default to localhost for web/simulator, but warn for physical devices
  API_BASE_URL = "http://localhost:3000";
  
  // In production or if explicitly needed, you should set EXPO_PUBLIC_API_URL
  // For physical devices, use your computer's IP: http://192.168.16.108:3000
}

// Log the API URL being used (helpful for debugging)
console.log("🚀 API Base URL:", API_BASE_URL);
console.log("📱 If using a physical device, ensure this points to your computer's IP address");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers["x-request-id"] = `req_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Log request details for debugging
    console.log("=== API REQUEST ===");
    console.log("Method:", config.method?.toUpperCase());
    console.log("URL:", config.url);
    console.log("Full URL:", `${config.baseURL}${config.url}`);
    console.log("Headers:", JSON.stringify(config.headers, null, 2));
    console.log("Data:", JSON.stringify(config.data, null, 2));
    console.log("==================");

    return config;
  },
  (error) => {
    console.error("=== REQUEST INTERCEPTOR ERROR ===");
    console.error("Error:", error);
    console.error("================================");
    return Promise.reject(error);
  }
);

// Response interceptor for error handling with retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: number;
    };

    // Log the error for debugging - VERY DETAILED
    if (error.response) {
      // Skip detailed logging for 404 errors on optional endpoints (weather, hotels, etc.)
      const isOptionalEndpoint = originalRequest?.url?.includes("/weather") || 
                                 originalRequest?.url?.includes("/hotels");
      const is404 = error.response.status === 404;
      const is401 = error.response.status === 401; // Authentication errors
      
      if (isOptionalEndpoint && is404) {
        // Silently handle 404s for optional endpoints - they're expected
        // The calling service will handle the fallback
      } else if (is401) {
        // For 401 errors (authentication failures), log minimal info
        // The user-facing error message is handled by the calling component
        console.warn("Authentication failed:", originalRequest?.url);
      } else {
        // Server responded with error status
        console.error("=== API ERROR (Server Response) ===");
        console.error("Status:", error.response.status);
        console.error("Status Text:", error.response.statusText);
        console.error("URL:", originalRequest?.method?.toUpperCase(), originalRequest?.url);
        console.error("Full URL:", `${API_BASE_URL}${originalRequest?.url}`);
        console.error("Response Headers:", JSON.stringify(error.response.headers, null, 2));
        console.error("Response Data:", JSON.stringify(error.response.data, null, 2));
        console.error("Error Message:", error.message);
        console.error("===================================");
      }
    } else if (error.request) {
      // Request made but no response received
      // Skip logging for optional endpoints (weather, hotels) - they're expected to fail sometimes
      const isOptionalEndpoint = originalRequest?.url?.includes("/weather") || 
                                 originalRequest?.url?.includes("/hotels");
      
      if (!isOptionalEndpoint) {
        console.error("❌ === NETWORK ERROR (No Response) ===");
        console.error("🔗 URL:", originalRequest?.method?.toUpperCase(), originalRequest?.url);
        console.error("🌐 Full URL:", `${API_BASE_URL}${originalRequest?.url}`);
        console.error("📍 Base URL:", API_BASE_URL);
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

    // Handle 401 - clear auth token
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("user");
    }

    // Parse error
    const apiError = parseAPIError(error);

    // Skip logging for 404 errors and network errors on optional endpoints (weather, hotels, etc.)
    // Also skip verbose logging for 401 authentication errors (they're expected user errors)
    const isOptionalEndpoint = originalRequest?.url?.includes("/weather") || 
                               originalRequest?.url?.includes("/hotels");
    const is404 = error.response?.status === 404;
    const is401 = error.response?.status === 401;
    const isNetworkError = !error.response && error.request; // Network error (no response)
    
    // Don't log errors that would show up on user screens
    // Only log to console for debugging, not for user display
    if (!(isOptionalEndpoint && (is404 || isNetworkError)) && !is401) {
      // Only log non-optional endpoint errors and non-authentication errors
      // Use console.warn instead of console.error to avoid triggering error overlays
      console.warn("Request failed:", {
        code: apiError.code,
        error: apiError.message,
        method: originalRequest?.method,
        statusCode: apiError.statusCode,
        url: originalRequest?.url,
      });
    }

    // Don't retry 4xx errors (client errors like validation, not found, etc.)
    // Only retry network errors and 5xx server errors
    // Also skip retries for optional endpoints (hotels, weather) - they have fallbacks
    const isClientError = error.response?.status && error.response.status >= 400 && error.response.status < 500;
    const maxRetries = isOptionalEndpoint ? 1 : 3; // Only 1 retry for optional endpoints
    
    // Retry logic for retryable errors (only network errors and server errors)
    if (!isClientError && isRetryableError(apiError) && originalRequest) {
      const retryCount = originalRequest._retry || 0;

      if (retryCount < maxRetries) {
        originalRequest._retry = retryCount + 1;

        // Wait before retrying
        const delay = getRetryDelay(retryCount);
        await new Promise((resolve) => setTimeout(resolve, delay));

        console.log(
          `Retrying request (attempt ${retryCount + 1}/${maxRetries}): ${originalRequest.url}`
        );
        return apiClient(originalRequest);
      }
    }

    // Log final error if all retries exhausted or non-retryable error
    // (Already logged above, but this is for retry exhaustion cases)
    if ((originalRequest?._retry && originalRequest._retry >= maxRetries) || isClientError) {
      // Skip logging for 404 errors on optional endpoints and 401 auth errors (already handled above)
      if (!(isOptionalEndpoint && is404) && !is401) {
        // Use console.warn instead of console.error to avoid triggering error overlays
        console.warn("Request failed:", {
          url: originalRequest?.url,
          method: originalRequest?.method,
          error: apiError.message,
          code: apiError.code,
          statusCode: apiError.statusCode,
        });
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
