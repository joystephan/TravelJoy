import { AxiosError } from "axios";

export interface APIError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

/**
 * Parse API error response
 */
export function parseAPIError(error: any): APIError {
  if (error.response) {
    // Server responded with error
    const { data, status } = error.response;
    return {
      code: data?.error?.code || "API_ERROR",
      message: data?.error?.message || "An error occurred",
      details: data?.error?.details,
      statusCode: status,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      code: "NETWORK_ERROR",
      message:
        "Unable to connect to server. Please check your internet connection.",
      statusCode: 0,
    };
  } else {
    // Something else happened
    return {
      code: "UNKNOWN_ERROR",
      message: error.message || "An unexpected error occurred",
      statusCode: 0,
    };
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: APIError): string {
  const errorMessages: Record<string, string> = {
    NETWORK_ERROR:
      "Unable to connect. Please check your internet connection and try again.",
    AUTH_ERROR: "Authentication failed. Please log in again.",
    FORBIDDEN: "You don't have permission to perform this action.",
    NOT_FOUND: "The requested resource was not found.",
    VALIDATION_ERROR: "Please check your input and try again.",
    RATE_LIMIT_EXCEEDED:
      "Too many requests. Please wait a moment and try again.",
    EXTERNAL_API_ERROR: "Unable to fetch travel data. Please try again later.",
    SUBSCRIPTION_REQUIRED: "This feature requires an active subscription.",
    TRIP_LIMIT_EXCEEDED:
      "You've reached your monthly trip limit. Upgrade to create more trips.",
  };

  return (
    errorMessages[error.code] ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: APIError): boolean {
  const retryableCodes = [
    "NETWORK_ERROR",
    "TIMEOUT_ERROR",
    "EXTERNAL_API_ERROR",
  ];

  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];

  return (
    retryableCodes.includes(error.code) ||
    retryableStatusCodes.includes(error.statusCode)
  );
}

/**
 * Calculate retry delay with exponential backoff
 */
export function getRetryDelay(attemptNumber: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);

  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}
