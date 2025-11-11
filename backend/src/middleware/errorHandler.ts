import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  if (err instanceof AppError) {
    const errorResponse: ErrorResponse = {
      error: {
        code: err.code || "INTERNAL_ERROR",
        message: err.message,
      },
      timestamp: new Date().toISOString(),
      requestId: requestId as string,
    };

    return res.status(err.statusCode).json(errorResponse);
  }

  // Handle Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    return handlePrismaError(err, res, requestId as string);
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    const errorResponse: ErrorResponse = {
      error: {
        code: "VALIDATION_ERROR",
        message: err.message,
      },
      timestamp: new Date().toISOString(),
      requestId: requestId as string,
    };

    return res.status(400).json(errorResponse);
  }

  // Handle unexpected errors
  const errorResponse: ErrorResponse = {
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : err.message,
    },
    timestamp: new Date().toISOString(),
    requestId: requestId as string,
  };

  res.status(500).json(errorResponse);
};

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(err: any, res: Response, requestId: string) {
  const errorResponse: ErrorResponse = {
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
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorResponse: ErrorResponse = {
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.url} not found`,
    },
    timestamp: new Date().toISOString(),
    requestId: (req.headers["x-request-id"] || generateRequestId()) as string,
  };

  res.status(404).json(errorResponse);
};
