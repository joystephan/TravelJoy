import { Response } from "express";

/**
 * Validation utility to avoid duplication across controllers
 * Provides consistent validation and error response formatting
 */

/**
 * Validate required fields in request body
 * @param res Express response object
 * @param fields Object with field names and values
 * @returns true if valid, false if validation failed (response already sent)
 */
export function validateRequiredFields(
  res: Response,
  fields: Record<string, any>
): boolean {
  const missingFields: string[] = [];

  for (const [fieldName, fieldValue] of Object.entries(fields)) {
    if (fieldValue === undefined || fieldValue === null || fieldValue === "") {
      missingFields.push(fieldName);
    }
  }

  if (missingFields.length > 0) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: `Missing required fields: ${missingFields.join(", ")}`,
      },
    });
    return false;
  }

  return true;
}

/**
 * Validate coordinate values
 * @param res Express response object
 * @param lat Latitude value
 * @param lon Longitude value
 * @returns true if valid, false if validation failed (response already sent)
 */
export function validateCoordinates(
  res: Response,
  lat: number,
  lon: number
): boolean {
  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid latitude or longitude values",
      },
    });
    return false;
  }

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message:
          "Latitude must be between -90 and 90, longitude between -180 and 180",
      },
    });
    return false;
  }

  return true;
}

/**
 * Validate date range
 * @param res Express response object
 * @param startDate Start date
 * @param endDate End date
 * @returns true if valid, false if validation failed (response already sent)
 */
export function validateDateRange(
  res: Response,
  startDate: Date,
  endDate: Date
): boolean {
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid date format",
      },
    });
    return false;
  }

  if (startDate >= endDate) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "End date must be after start date",
      },
    });
    return false;
  }

  return true;
}

/**
 * Validate positive number
 * @param res Express response object
 * @param value Value to validate
 * @param fieldName Field name for error message
 * @returns true if valid, false if validation failed (response already sent)
 */
export function validatePositiveNumber(
  res: Response,
  value: number,
  fieldName: string
): boolean {
  if (value <= 0) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: `${fieldName} must be greater than 0`,
      },
    });
    return false;
  }

  return true;
}

/**
 * Send standardized error response
 * @param res Express response object
 * @param statusCode HTTP status code
 * @param code Error code
 * @param message Error message
 */
export function sendErrorResponse(
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}

/**
 * Send standardized success response
 * @param res Express response object
 * @param data Response data
 * @param message Optional success message
 */
export function sendSuccessResponse(
  res: Response,
  data: any,
  message?: string
): void {
  const response: any = {};
  
  if (message) {
    response.message = message;
  }
  
  if (data !== undefined) {
    response.data = data;
  }
  
  res.json(response);
}

