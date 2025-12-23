"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelController = exports.HotelController = void 0;
const externalApiService_1 = __importDefault(require("../services/externalApiService"));
class HotelController {
    /**
     * Search for hotels in a location
     */
    async searchHotels(req, res) {
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
            const hotels = await externalApiService_1.default.searchHotels(location, {
                limit: limit ? parseInt(limit, 10) : 20,
            });
            res.json({
                success: true,
                data: hotels,
                count: hotels.length,
            });
        }
        catch (error) {
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
    async getPopularHotels(req, res) {
        try {
            // Popular destinations to show hotels for
            const popularDestinations = [
                "Paris, France",
                "London, England",
                "Tokyo, Japan",
                "New York, USA",
                "Barcelona, Spain",
                "Dubai, UAE",
                "Beirut, Lebanon",
                "Rome, Italy",
                "Amsterdam, Netherlands",
                "Berlin, Germany",
                "Singapore",
                "Bangkok, Thailand",
                "Sydney, Australia",
                "Istanbul, Turkey",
                "Cairo, Egypt",
                "Marrakech, Morocco",
            ];
            // Fetch hotels for each destination (limit 5 per destination for more variety)
            const hotelPromises = popularDestinations.map((location) => externalApiService_1.default
                .searchHotels(location, { limit: 5 })
                .then((hotels) => hotels.map((hotel) => ({ ...hotel, destination: location })))
                .catch(() => []) // Continue even if one fails
            );
            const allHotels = await Promise.all(hotelPromises);
            const flattenedHotels = allHotels.flat();
            res.json({
                success: true,
                data: flattenedHotels,
                count: flattenedHotels.length,
            });
        }
        catch (error) {
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
exports.HotelController = HotelController;
exports.hotelController = new HotelController();
