"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const aiService_1 = require("./aiService");
const tripService_1 = require("./tripService");
const database_1 = __importDefault(require("../config/database"));
class ChatService {
    constructor() {
        this.sessions = new Map();
    }
    /**
     * Get or create chat session for user
     */
    getSession(userId, tripId) {
        const sessionKey = tripId ? `${userId}:${tripId}` : userId;
        if (!this.sessions.has(sessionKey)) {
            this.sessions.set(sessionKey, {
                userId,
                tripId,
                messages: [],
            });
        }
        return this.sessions.get(sessionKey);
    }
    /**
     * Process chat message with context
     */
    async processMessage(userId, message, tripId) {
        const session = this.getSession(userId, tripId);
        // Add user message to session
        session.messages.push({
            role: "user",
            content: message,
            timestamp: new Date(),
        });
        // Build context
        const context = {
            tripId,
            conversationHistory: session.messages.map((m) => ({
                role: m.role,
                content: m.content,
            })),
        };
        // Get current trip plan if tripId is provided
        if (tripId) {
            try {
                const trip = await tripService_1.tripService.getTripById(tripId);
                // Convert to DailyPlan format
                context.currentPlan = trip.dailyPlans.map((dp) => ({
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
            }
            catch (error) {
                console.warn("Failed to load trip context:", error);
            }
        }
        // Process with AI
        const response = await aiService_1.aiService.processChat(message, context);
        // Add assistant response to session
        session.messages.push({
            role: "assistant",
            content: response.message,
            timestamp: new Date(),
        });
        // If plan was updated, save to database
        if (response.action === "update_plan" && response.updatedPlan && tripId) {
            try {
                // Delete existing daily plans
                await database_1.default.dailyPlan.deleteMany({
                    where: { tripId },
                });
                // Save updated plans
                await this.saveDailyPlans(tripId, response.updatedPlan);
            }
            catch (error) {
                console.error("Failed to save updated plan:", error);
            }
        }
        // Keep only last 20 messages to prevent memory issues
        if (session.messages.length > 20) {
            session.messages = session.messages.slice(-20);
        }
        return response;
    }
    /**
     * Process quick action
     */
    async processQuickAction(userId, action, tripId) {
        const actionMessages = {
            weather: "What is the weather forecast for my trip?",
            budget: "Show me a breakdown of my trip budget",
            optimize: "Can you optimize my itinerary to save money?",
            restaurants: "Suggest some good restaurants near my activities",
            activities: "What are some alternative activities I can do?",
            transport: "What are the best transportation options?",
        };
        const message = actionMessages[action] || action;
        return this.processMessage(userId, message, tripId);
    }
    /**
     * Get chat history for a session
     */
    getChatHistory(userId, tripId) {
        const session = this.getSession(userId, tripId);
        return session.messages;
    }
    /**
     * Clear chat history for a session
     */
    clearChatHistory(userId, tripId) {
        const sessionKey = tripId ? `${userId}:${tripId}` : userId;
        this.sessions.delete(sessionKey);
    }
    /**
     * Save daily plans to database (helper method)
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
                        fromLatitude: 0,
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
     * Modify trip plan through natural language
     */
    async modifyTripPlan(userId, tripId, modification) {
        const response = await this.processMessage(userId, `Please modify my trip: ${modification}`, tripId);
        if (response.action === "update_plan") {
            // Fetch updated trip
            return tripService_1.tripService.getTripById(tripId);
        }
        return {
            message: response.message,
            modified: false,
        };
    }
}
exports.chatService = new ChatService();
