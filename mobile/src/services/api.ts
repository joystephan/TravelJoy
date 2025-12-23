import axios, { AxiosError, AxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  parseAPIError,
  isRetryableError,
  getRetryDelay,
} from "../utils/apiErrorHandler";
import { apiLogger } from "../utils/apiLogger";

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
    apiLogger.logRequest(
      config.method?.toUpperCase() || "GET",
      config.url || "",
      `${config.baseURL}${config.url}`,
      config.headers,
      config.data
    );

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

    // Log the error for debugging
    apiLogger.logError(
      error,
      originalRequest?.url,
      originalRequest?.method,
      API_BASE_URL,
      { skipOptionalEndpoints: true }
    );

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

        apiLogger.logRetry(originalRequest.url || "", retryCount + 1, maxRetries);
        return apiClient(originalRequest);
      }
    }

    // Log final error if all retries exhausted or non-retryable error
    const shouldLogFinalError =
      (originalRequest?._retry && originalRequest._retry >= maxRetries) || isClientError;
    const shouldSkipLog = (isOptionalEndpoint && is404) || is401;

    if (shouldLogFinalError && !shouldSkipLog) {
      apiLogger.logFinalFailure(
        originalRequest?.url || "",
        originalRequest?.method || "",
        apiError
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
