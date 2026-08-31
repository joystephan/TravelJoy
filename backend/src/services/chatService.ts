import { aiService, ChatContext, ChatResponse } from "./aiService";
import { tripService } from "./tripService";
import prisma from "../config/database";
import { saveDailyPlans, deleteDailyPlans } from "../utils/databaseHelper";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  userId: string;
  tripId?: string;
  messages: ChatMessage[];
}

class ChatService {
  private sessions: Map<string, ChatSession> = new Map();

  /**
   * Get or create chat session for user
   */
  private getSession(userId: string, tripId?: string): ChatSession {
    const sessionKey = tripId ? `${userId}:${tripId}` : userId;

    if (!this.sessions.has(sessionKey)) {
      this.sessions.set(sessionKey, {
        userId,
        tripId,
        messages: [],
      });
    }

    return this.sessions.get(sessionKey)!;
  }

  /**
   * Process chat message with context
   */
  async processMessage(
    userId: string,
    message: string,
    tripId?: string
  ): Promise<ChatResponse> {
    const session = this.getSession(userId, tripId);

    // Add user message to session
    session.messages.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    // Build context
    const context: ChatContext = {
      tripId,
      conversationHistory: session.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    // Get current trip plan if tripId is provided
    if (tripId) {
      try {
        const trip = await tripService.getTripById(tripId);

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
            type: m.mealType as any,
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
            type: t.mode as any,
            from: t.fromLocation,
            to: t.toLocation,
            duration: t.duration,
            cost: t.cost,
            time: "",
          })),
          estimatedCost: dp.estimatedCost,
        }));
      } catch (error) {
        console.warn("Failed to load trip context:", error);
      }
    }

    // Process with AI
    const response = await aiService.processChat(message, context);

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
        await deleteDailyPlans(tripId);

        // Save updated plans
        await saveDailyPlans(tripId, response.updatedPlan);
      } catch (error) {
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
  async processQuickAction(
    userId: string,
    action: string,
    tripId?: string
  ): Promise<ChatResponse> {
    const actionMessages: Record<string, string> = {
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
  getChatHistory(userId: string, tripId?: string): ChatMessage[] {
    const session = this.getSession(userId, tripId);
    return session.messages;
  }

  /**
   * Clear chat history for a session
   */
  clearChatHistory(userId: string, tripId?: string): void {
    const sessionKey = tripId ? `${userId}:${tripId}` : userId;
    this.sessions.delete(sessionKey);
  }

  /**
   * Modify trip plan through natural language
   */
  async modifyTripPlan(
    userId: string,
    tripId: string,
    modification: string
  ): Promise<any> {
    const response = await this.processMessage(
      userId,
      `Please modify my trip: ${modification}`,
      tripId
    );

    if (response.action === "update_plan") {
      // Fetch updated trip
      return tripService.getTripById(tripId);
    }

    return {
      message: response.message,
      modified: false,
    };
  }
}

export const chatService = new ChatService();
