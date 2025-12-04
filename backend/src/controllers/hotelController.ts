import { Request, Response } from "express";
import externalApiService from "../services/externalApiService";

export class HotelController {
  /**
   * Search for hotels in a location
   */
  async searchHotels(req: Request, res: Response) {
    try {
      const { location, limit } = req.query;

      if (!location || typeof location !== "string") {
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Location parameter is required",
          },
        });
      }

      const hotels = await externalApiService.searchHotels(location, {
        limit: limit ? parseInt(limit as string, 10) : 20,
      });

      res.json({
        success: true,
        data: hotels,
        count: hotels.length,
      });
    } catch (error: any) {
      console.error("Hotel search error:", error);
      res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to search hotels",
        },
      });
    }
  }

  /**
   * Get popular hotels (default locations)
   */
  async getPopularHotels(req: Request, res: Response) {
    try {
      // Popular destinations to show hotels for
      const popularDestinations = [
        "Paris, France",
        "London, England",
        "Tokyo, Japan",
        "New York, USA",
        "Barcelona, Spain",
        "Dubai, UAE",
      ];

      // Fetch hotels for each destination (limit 3 per destination)
      const hotelPromises = popularDestinations.map((location) =>
        externalApiService
          .searchHotels(location, { limit: 3 })
          .then((hotels) =>
            hotels.map((hotel) => ({ ...hotel, destination: location }))
          )
          .catch(() => []) // Continue even if one fails
      );

      const allHotels = await Promise.all(hotelPromises);
      const flattenedHotels = allHotels.flat();

      res.json({
        success: true,
        data: flattenedHotels,
        count: flattenedHotels.length,
      });
    } catch (error: any) {
      console.error("Popular hotels error:", error);
      res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: error.message || "Failed to fetch popular hotels",
        },
      });
    }
  }
}

export const hotelController = new HotelController();

