/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = "VALIDATION_ERROR") {
    super(message, 400, code);
  }
}

export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication failed",
    code: string = "AUTH_ERROR"
  ) {
    super(message, 401, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Access denied", code: string = "FORBIDDEN") {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    code: string = "NOT_FOUND"
  ) {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = "CONFLICT") {
    super(message, 409, code);
  }
}

export class ExternalAPIError extends AppError {
  constructor(
    message: string = "External API request failed",
    code: string = "EXTERNAL_API_ERROR"
  ) {
    super(message, 503, code);
  }
}

export class RateLimitError extends AppError {
  constructor(
    message: string = "Rate limit exceeded",
    code: string = "RATE_LIMIT_EXCEEDED"
  ) {
    super(message, 429, code);
  }
}
