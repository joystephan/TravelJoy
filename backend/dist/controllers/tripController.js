"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripController = exports.TripController = void 0;
const tripService_1 = require("../services/tripService");
class TripController {
    /**
     * Create a new trip
     */
    async createTrip(req, res) {
        try {
            const userId = req.user.userId;
            const { destination, budget, startDate, endDate, preferences } = req.body;
            // Validate required fields
            if (!destination || !budget || !startDate || !endDate) {
                return res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Missing required fields: destination, budget, startDate, endDate",
                    },
                });
            }
            // Validate dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Invalid date format",
                    },
                });
            }
            if (start >= end) {
                return res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "End date must be after start date",
                    },
                });
            }
            // Validate budget
            if (budget <= 0) {
                return res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Budget must be greater than 0",
                    },
                });
            }
            const trip = await tripService_1.tripService.createTrip({
                userId,
                destination,
                budget: parseFloat(budget),
                startDate: start,
                endDate: end,
                preferences,
            });
            res.status(201).json({
                message: "Trip created successfully. Itinerary is being generated.",
                trip,
            });
        }
        catch (error) {
            console.error("Create trip error:", error);
            res.status(500).json({
                error: {
                    code: "TRIP_CREATION_ERROR",
                    message: error.message || "Failed to create trip",
                },
            });
        }
    }
    /**
     * Get trip by ID
     */
    async getTripById(req, res) {
        try {
            const { tripId } = req.params;
            const userId = req.user.userId;
            const trip = await tripService_1.tripService.getTripById(tripId);
            // Verify ownership
            if (trip.userId !== userId) {
                return res.status(403).json({
                    error: {
                        code: "FORBIDDEN",
                        message: "You do not have access to this trip",
                    },
                });
            }
            res.json({ trip });
        }
        catch (error) {
            console.error("Get trip error:", error);
            if (error.message === "Trip not found") {
                return res.status(404).json({
                    error: {
                        code: "NOT_FOUND",
                        message: "Trip not found",
                    },
                });
            }
            res.status(500).json({
                error: {
                    code: "FETCH_ERROR",
                    message: "Failed to fetch trip",
                },
            });
        }
    }
    /**
     * Get all trips for the authenticated user
     */
    async getUserTrips(req, res) {
        try {
            const userId = req.user.userId;
            const trips = await tripService_1.tripService.getUserTrips(userId);
            res.json({ trips });
        }
        catch (error) {
            console.error("Get user trips error:", error);
            res.status(500).json({
                error: {
                    code: "FETCH_ERROR",
                    message: "Failed to fetch trips",
                },
            });
        }
    }
    /**
     * Update an activity
     */
    async updateActivity(req, res) {
        try {
            const { activityId } = req.params;
            const updates = req.body;
            const activity = await tripService_1.tripService.updateActivity(activityId, updates);
            res.json({
                message: "Activity updated successfully",
                activity,
            });
        }
        catch (error) {
            console.error("Update activity error:", error);
            res.status(500).json({
                error: {
                    code: "UPDATE_ERROR",
                    message: "Failed to update activity",
                },
            });
        }
    }
    /**
     * Delete an activity
     */
    async deleteActivity(req, res) {
        try {
            const { activityId } = req.params;
            await tripService_1.tripService.deleteActivity(activityId);
            res.json({
                message: "Activity deleted successfully",
            });
        }
        catch (error) {
            console.error("Delete activity error:", error);
            res.status(500).json({
                error: {
                    code: "DELETE_ERROR",
                    message: "Failed to delete activity",
                },
            });
        }
    }
    /**
     * Replace an activity with an alternative
     */
    async replaceActivity(req, res) {
        try {
            const { activityId } = req.params;
            const newActivity = req.body;
            const activity = await tripService_1.tripService.replaceActivity(activityId, newActivity);
            res.json({
                message: "Activity replaced successfully",
                activity,
            });
        }
        catch (error) {
            console.error("Replace activity error:", error);
            res.status(500).json({
                error: {
                    code: "REPLACE_ERROR",
                    message: "Failed to replace activity",
                },
            });
        }
    }
    /**
     * Optimize trip based on new constraints
     */
    async optimizeTrip(req, res) {
        try {
            const { tripId } = req.params;
            const userId = req.user.userId;
            const { budget, preferences } = req.body;
            // Verify ownership
            const trip = await tripService_1.tripService.getTripById(tripId);
            if (trip.userId !== userId) {
                return res.status(403).json({
                    error: {
                        code: "FORBIDDEN",
                        message: "You do not have access to this trip",
                    },
                });
            }
            const optimizedTrip = await tripService_1.tripService.optimizeTrip(tripId, {
                budget,
                preferences,
            });
            res.json({
                message: "Trip optimized successfully",
                trip: optimizedTrip,
            });
        }
        catch (error) {
            console.error("Optimize trip error:", error);
            res.status(500).json({
                error: {
                    code: "OPTIMIZATION_ERROR",
                    message: "Failed to optimize trip",
                },
            });
        }
    }
    /**
     * Delete a trip
     */
    async deleteTrip(req, res) {
        try {
            const { tripId } = req.params;
            const userId = req.user.userId;
            // Verify ownership
            const trip = await tripService_1.tripService.getTripById(tripId);
            if (trip.userId !== userId) {
                return res.status(403).json({
                    error: {
                        code: "FORBIDDEN",
                        message: "You do not have access to this trip",
                    },
                });
            }
            await tripService_1.tripService.deleteTrip(tripId);
            res.json({
                message: "Trip deleted successfully",
            });
        }
        catch (error) {
            console.error("Delete trip error:", error);
            res.status(500).json({
                error: {
                    code: "DELETE_ERROR",
                    message: "Failed to delete trip",
                },
            });
        }
    }
}
exports.TripController = TripController;
exports.tripController = new TripController();
