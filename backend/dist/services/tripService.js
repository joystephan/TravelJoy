"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripService = void 0;
const aiService_1 = require("./aiService");
const weatherService_1 = __importDefault(require("./weatherService"));
const nominatimService_1 = __importDefault(require("./nominatimService"));
const database_1 = __importDefault(require("../config/database"));
class TripService {
    /**
     * Create a new trip with AI-generated itinerary
     */
    async createTrip(tripData) {
        // Validate user subscription and trip limits
        const user = await database_1.default.user.findUnique({
            where: { id: tripData.userId },
            include: { subscription: true },
        });
        if (!user) {
            throw new Error("User not found");
        }
        // Check trip limits based on subscription
        if (!user.subscription || user.subscription.status !== "active") {
            throw new Error("Active subscription required to create trips");
        }
        // Create trip record
        const trip = await database_1.default.trip.create({
            data: {
                userId: tripData.userId,
                destination: tripData.destination,
                budget: tripData.budget,
                startDate: tripData.startDate,
                endDate: tripData.endDate,
                status: "generating",
            },
        });
        // Generate itinerary asynchronously
        this.generateItineraryForTrip(trip.id, tripData).catch((error) => {
            console.error(`Failed to generate itinerary for trip ${trip.id}:`, error);
            // Update trip status to failed
            database_1.default.trip.update({
                where: { id: trip.id },
                data: { status: "failed" },
            });
        });
        return trip;
    }
    /**
     * Generate itinerary for a trip using AI
     */
    async generateItineraryForTrip(tripId, tripData) {
        try {
            // Get destination coordinates
            const locationResults = await nominatimService_1.default.searchPlaces(tripData.destination);
            if (!locationResults || locationResults.length === 0) {
                throw new Error("Destination not found");
            }
            const location = locationResults[0];
            const coordinates = location.coordinates;
            // Get weather data for the trip dates
            let weatherData;
            try {
                weatherData = await weatherService_1.default.getForecast(coordinates);
            }
            catch (error) {
                console.warn("Failed to fetch weather data:", error);
            }
            // Search for places of interest
            let placesData;
            try {
                placesData = await nominatimService_1.default.searchPlaces(`attractions in ${tripData.destination}`);
            }
            catch (error) {
                console.warn("Failed to fetch places data:", error);
            }
            // Prepare AI generation parameters
            const aiParams = {
                destination: tripData.destination,
                budget: tripData.budget,
                startDate: tripData.startDate,
                endDate: tripData.endDate,
                preferences: tripData.preferences || {},
                weatherData,
                placesData,
            };
            // Generate itinerary using AI
            const dailyPlans = await aiService_1.aiService.generateItinerary(aiParams);
            // Save itinerary to database
            await this.saveDailyPlans(tripId, dailyPlans);
            // Update trip status
            await database_1.default.trip.update({
                where: { id: tripId },
                data: { status: "completed" },
            });
            return dailyPlans;
        }
        catch (error) {
            console.error("Itinerary generation failed:", error);
            await database_1.default.trip.update({
                where: { id: tripId },
                data: { status: "failed" },
            });
            throw error;
        }
    }
    /**
     * Save daily plans to database
     */
    async saveDailyPlans(tripId, dailyPlans) {
        for (const plan of dailyPlans) {
            const dailyPlan = await database_1.default.dailyPlan.create({
                data: {
                    tripId,
                    date: plan.date,
                    estimatedCost: plan.estimatedCost,
                },
            });
            // Save activities
            if (plan.activities && plan.activities.length > 0) {
                await database_1.default.activity.createMany({
                    data: plan.activities.map((activity) => ({
                        dailyPlanId: dailyPlan.id,
                        name: activity.name,
                        description: activity.description,
                        latitude: activity.location.lat,
                        longitude: activity.location.lon,
                        duration: activity.duration,
                        cost: activity.cost,
                        category: activity.category,
                    })),
                });
            }
            // Save meals
            if (plan.meals && plan.meals.length > 0) {
                await database_1.default.meal.createMany({
                    data: plan.meals.map((meal) => ({
                        dailyPlanId: dailyPlan.id,
                        name: meal.name,
                        latitude: meal.location.lat,
                        longitude: meal.location.lon,
                        mealType: meal.type,
                        cost: meal.cost,
                        cuisine: meal.cuisine,
                    })),
                });
            }
            // Save transportation
            if (plan.transportation && plan.transportation.length > 0) {
                await database_1.default.transportation.createMany({
                    data: plan.transportation.map((transport) => ({
                        dailyPlanId: dailyPlan.id,
                        fromLocation: transport.from,
                        toLocation: transport.to,
                        fromLatitude: 0, // Default values, can be enhanced
                        fromLongitude: 0,
                        toLatitude: 0,
                        toLongitude: 0,
                        mode: transport.type,
                        duration: transport.duration,
                        cost: transport.cost,
                    })),
                });
            }
        }
    }
    /**
     * Get trip by ID with full itinerary
     */
    async getTripById(tripId) {
        const trip = await database_1.default.trip.findUnique({
            where: { id: tripId },
            include: {
                dailyPlans: {
                    include: {
                        activities: true,
                        meals: true,
                        transportations: true,
                    },
                    orderBy: {
                        date: "asc",
                    },
                },
            },
        });
        if (!trip) {
            throw new Error("Trip not found");
        }
        return trip;
    }
    /**
     * Get all trips for a user
     */
    async getUserTrips(userId) {
        return database_1.default.trip.findMany({
            where: { userId },
            include: {
                dailyPlans: {
                    include: {
                        activities: true,
                        meals: true,
                        transportations: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    /**
     * Update an activity in the itinerary
     */
    async updateActivity(activityId, updates) {
        return database_1.default.activity.update({
            where: { id: activityId },
            data: updates,
        });
    }
    /**
     * Delete an activity from the itinerary
     */
    async deleteActivity(activityId) {
        return database_1.default.activity.delete({
            where: { id: activityId },
        });
    }
    /**
     * Replace an activity with an alternative
     */
    async replaceActivity(activityId, newActivity) {
        const activity = await database_1.default.activity.findUnique({
            where: { id: activityId },
        });
        if (!activity) {
            throw new Error("Activity not found");
        }
        return database_1.default.activity.update({
            where: { id: activityId },
            data: {
                ...newActivity,
            },
        });
    }
    /**
     * Optimize existing trip based on new constraints
     */
    async optimizeTrip(tripId, constraints) {
        const trip = await this.getTripById(tripId);
        // Convert database format to DailyPlan format
        const currentPlans = trip.dailyPlans.map((dp) => ({
            date: dp.date,
            activities: dp.activities.map((a) => ({
                name: a.name,
                description: a.description || "",
                location: {
                    lat: a.latitude,
                    lon: a.longitude,
                    address: "",
                },
                duration: a.duration,
                cost: a.cost,
                category: a.category,
                startTime: "",
                endTime: "",
            })),
            meals: dp.meals.map((m) => ({
                name: m.name,
                type: m.mealType,
                location: {
                    lat: m.latitude,
                    lon: m.longitude,
                    address: "",
                },
                cost: m.cost,
                cuisine: m.cuisine || "",
                time: "",
            })),
            transportation: dp.transportations.map((t) => ({
                type: t.mode,
                from: t.fromLocation,
                to: t.toLocation,
                duration: t.duration,
                cost: t.cost,
                time: "",
            })),
            estimatedCost: dp.estimatedCost,
        }));
        // Get weather data if needed
        let weatherData;
        if (trip.destination) {
            try {
                const locationResults = await nominatimService_1.default.searchPlaces(trip.destination);
                if (locationResults && locationResults.length > 0) {
                    const location = locationResults[0];
                    weatherData = await weatherService_1.default.getForecast(location.coordinates);
                }
            }
            catch (error) {
                console.warn("Failed to fetch weather data for optimization:", error);
            }
        }
        // Optimize using AI
        const optimizedPlans = await aiService_1.aiService.optimizePlan(currentPlans, {
            budget: constraints.budget,
            weather: weatherData,
            preferences: constraints.preferences,
        });
        // Delete existing daily plans
        await database_1.default.dailyPlan.deleteMany({
            where: { tripId },
        });
        // Save optimized plans
        await this.saveDailyPlans(tripId, optimizedPlans);
        // Update trip budget if provided
        if (constraints.budget) {
            await database_1.default.trip.update({
                where: { id: tripId },
                data: { budget: constraints.budget },
            });
        }
        return this.getTripById(tripId);
    }
    /**
     * Delete a trip
     */
    async deleteTrip(tripId) {
        return database_1.default.trip.delete({
            where: { id: tripId },
        });
    }
}
exports.tripService = new TripService();
