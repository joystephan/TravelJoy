"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.asyncHandler = exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    // Generate request ID for tracking
    const requestId = req.headers["x-request-id"] || generateRequestId();
    // Log error
    console.error(`[${requestId}] Error:`, {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
    });
    // Handle known operational errors
    if (err instanceof errors_1.AppError) {
        const errorResponse = {
            error: {
                code: err.code || "INTERNAL_ERROR",
                message: err.message,
            },
            timestamp: new Date().toISOString(),
            requestId: requestId,
        };
        return res.status(err.statusCode).json(errorResponse);
    }
    // Handle Prisma errors
    if (err.name === "PrismaClientKnownRequestError") {
        return handlePrismaError(err, res, requestId);
    }
    // Handle validation errors
    if (err.name === "ValidationError") {
        const errorResponse = {
            error: {
                code: "VALIDATION_ERROR",
                message: err.message,
            },
            timestamp: new Date().toISOString(),
            requestId: requestId,
        };
        return res.status(400).json(errorResponse);
    }
    // Handle unexpected errors
    const errorResponse = {
        error: {
            code: "INTERNAL_ERROR",
            message: process.env.NODE_ENV === "production"
                ? "An unexpected error occurred"
                : err.message,
        },
        timestamp: new Date().toISOString(),
        requestId: requestId,
    };
    res.status(500).json(errorResponse);
};
exports.errorHandler = errorHandler;
/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(err, res, requestId) {
    const errorResponse = {
        error: {
            code: err.code || "DATABASE_ERROR",
            message: "Database operation failed",
        },
        timestamp: new Date().toISOString(),
        requestId,
    };
    // Handle specific Prisma error codes
    switch (err.code) {
        case "P2002":
            errorResponse.error.message = "A record with this value already exists";
            return res.status(409).json(errorResponse);
        case "P2025":
            errorResponse.error.message = "Record not found";
            return res.status(404).json(errorResponse);
        case "P2003":
            errorResponse.error.message = "Foreign key constraint failed";
            return res.status(400).json(errorResponse);
        default:
            return res.status(500).json(errorResponse);
    }
}
/**
 * Generate a unique request ID
 */
function generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Async error wrapper for route handlers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res, next) => {
    const errorResponse = {
        error: {
            code: "NOT_FOUND",
            message: `Route ${req.method} ${req.url} not found`,
        },
        timestamp: new Date().toISOString(),
        requestId: (req.headers["x-request-id"] || generateRequestId()),
    };
    res.status(404).json(errorResponse);
};
exports.notFoundHandler = notFoundHandler;
