"use strict";
/**
 * Custom error classes for better error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.ExternalAPIError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500, code, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, code = "VALIDATION_ERROR") {
        super(message, 400, code);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = "Authentication failed", code = "AUTH_ERROR") {
        super(message, 401, code);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = "Access denied", code = "FORBIDDEN") {
        super(message, 403, code);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = "Resource not found", code = "NOT_FOUND") {
        super(message, 404, code);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message, code = "CONFLICT") {
        super(message, 409, code);
    }
}
exports.ConflictError = ConflictError;
class ExternalAPIError extends AppError {
    constructor(message = "External API request failed", code = "EXTERNAL_API_ERROR") {
        super(message, 503, code);
    }
}
exports.ExternalAPIError = ExternalAPIError;
class RateLimitError extends AppError {
    constructor(message = "Rate limit exceeded", code = "RATE_LIMIT_EXCEEDED") {
        super(message, 429, code);
    }
}
exports.RateLimitError = RateLimitError;
