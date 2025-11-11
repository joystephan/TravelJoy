import axios from "axios";
import redisClient from "../config/redis";

// Types for AI service
export interface TravelPreferences {
  activityType?: string[];
  foodPreference?: string[];
  transportPreference?: string[];
  schedulePreference?: "relaxed" | "moderate" | "packed";
  accessibility?: string[];
}

export interface DailyPlan {
  date: Date;
  activities: Activity[];
  meals: Meal[];
  transportation: Transportation[];
  estimatedCost: number;
}

export interface Activity {
  name: string;
  description: string;
  location: {
    lat: number;
    lon: number;
    address: string;
  };
  duration: number;
  cost: number;
  category: string;
  startTime: string;
  endTime: string;
}

export interface Meal {
  name: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  location: {
    lat: number;
    lon: number;
    address: string;
  };
  cost: number;
  cuisine: string;
  time: string;
}

export interface Transportation {
  type: "walk" | "taxi" | "bus" | "train" | "car";
  from: string;
  to: string;
  duration: number;
  cost: number;
  time: string;
}

export interface ChatContext {
  tripId?: string;
  currentPlan?: DailyPlan[];
  conversationHistory?: Array<{ role: string; content: string }>;
}

export interface ChatResponse {
  message: string;
  action?: "update_plan" | "provide_info" | "none";
  updatedPlan?: DailyPlan[];
}

export interface ItineraryGenerationParams {
  destination: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  preferences: TravelPreferences;
  weatherData?: any;
  placesData?: any[];
}

// AI Provider configuration
type AIProvider = "ollama" | "huggingface";

class AIService {
  private provider: AIProvider;
  private ollamaUrl: string;
  private huggingfaceApiKey: string;
  private model: string;

  constructor() {
    this.provider = (process.env.AI_PROVIDER as AIProvider) || "ollama";
    this.ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
    this.huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY || "";
    this.model = process.env.AI_MODEL || "llama2";
  }

  /**
   * Generate AI completion using configured provider
   */
  private async generateCompletion(
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    const cacheKey = `ai:completion:${Buffer.from(prompt)
      .toString("base64")
      .substring(0, 50)}`;

    // Check cache first
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (error) {
      console.warn("Redis cache check failed:", error);
    }

    let response: string;

    if (this.provider === "ollama") {
      response = await this.generateOllamaCompletion(prompt, systemPrompt);
    } else {
      response = await this.generateHuggingFaceCompletion(prompt, systemPrompt);
    }

    // Cache the response for 1 hour
    try {
      await redisClient.setex(cacheKey, 3600, response);
    } catch (error) {
      console.warn("Redis cache set failed:", error);
    }

    return response;
  }

  /**
   * Generate completion using Ollama local LLM
   */
  private async generateOllamaCompletion(
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        },
        {
          timeout: 60000, // 60 second timeout
        }
      );

      return response.data.response;
    } catch (error: any) {
      console.error("Ollama API error:", error.message);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  /**
   * Generate completion using HuggingFace API
   */
  private async generateHuggingFaceCompletion(
    prompt: string,
    systemPrompt?: string
  ): Promise<string> {
    if (!this.huggingfaceApiKey) {
      throw new Error("HuggingFace API key not configured");
    }

    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${this.model}`,
        {
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 2000,
            temperature: 0.7,
            top_p: 0.9,
            return_full_text: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.huggingfaceApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 60000,
        }
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0].generated_text;
      }

      return response.data.generated_text || "";
    } catch (error: any) {
      console.error("HuggingFace API error:", error.message);
      throw new Error(`Failed to generate AI response: ${error.message}`);
    }
  }

  /**
   * Create prompt template for itinerary generation
   */
  private createItineraryPrompt(params: ItineraryGenerationParams): string {
    const {
      destination,
      budget,
      startDate,
      endDate,
      preferences,
      weatherData,
      placesData,
    } = params;

    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const dailyBudget = budget / days;

    let prompt = `Generate a detailed ${days}-day travel itinerary for ${destination}.

TRIP DETAILS:
- Destination: ${destination}
- Total Budget: $${budget} (approximately $${dailyBudget.toFixed(2)} per day)
- Start Date: ${startDate.toISOString().split("T")[0]}
- End Date: ${endDate.toISOString().split("T")[0]}
- Number of Days: ${days}

PREFERENCES:
- Activity Types: ${preferences.activityType?.join(", ") || "any"}
- Food Preferences: ${preferences.foodPreference?.join(", ") || "any"}
- Transport Preferences: ${preferences.transportPreference?.join(", ") || "any"}
- Schedule Preference: ${preferences.schedulePreference || "moderate"}
`;

    if (weatherData) {
      prompt += `\nWEATHER FORECAST:\n${JSON.stringify(
        weatherData,
        null,
        2
      )}\n`;
    }

    if (placesData && placesData.length > 0) {
      prompt += `\nAVAILABLE ATTRACTIONS:\n${placesData
        .map((p) => `- ${p.display_name || p.name}`)
        .join("\n")}\n`;
    }

    prompt += `
REQUIREMENTS:
1. Create a day-by-day itinerary with specific activities, meals, and transportation
2. Include estimated costs for each item
3. Consider opening hours and optimal visiting times
4. Balance the daily budget across all days
5. Include breakfast, lunch, and dinner for each day
6. Add transportation between activities
7. Consider weather conditions if provided
8. Match the schedule preference (relaxed = 2-3 activities/day, moderate = 3-4, packed = 5+)

FORMAT YOUR RESPONSE AS JSON:
{
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "name": "Activity Name",
          "description": "Brief description",
          "location": {"lat": 0, "lon": 0, "address": "Address"},
          "duration": 120,
          "cost": 25,
          "category": "museum",
          "startTime": "09:00",
          "endTime": "11:00"
        }
      ],
      "meals": [
        {
          "name": "Restaurant Name",
          "type": "breakfast",
          "location": {"lat": 0, "lon": 0, "address": "Address"},
          "cost": 15,
          "cuisine": "local",
          "time": "08:00"
        }
      ],
      "transportation": [
        {
          "type": "walk",
          "from": "Hotel",
          "to": "Activity Name",
          "duration": 15,
          "cost": 0,
          "time": "08:45"
        }
      ],
      "estimatedCost": 100
    }
  ]
}

Generate the complete itinerary now:`;

    return prompt;
  }

  /**
   * Parse and validate AI response for itinerary generation
   */
  private parseItineraryResponse(
    response: string,
    params: ItineraryGenerationParams
  ): DailyPlan[] {
    try {
      // Extract JSON from response (handle cases where AI adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No valid JSON found in AI response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.itinerary || !Array.isArray(parsed.itinerary)) {
        throw new Error("Invalid itinerary format");
      }

      // Convert to DailyPlan format
      const dailyPlans: DailyPlan[] = parsed.itinerary.map((day: any) => ({
        date: new Date(day.date),
        activities: day.activities || [],
        meals: day.meals || [],
        transportation: day.transportation || [],
        estimatedCost: day.estimatedCost || 0,
      }));

      return dailyPlans;
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      // Return fallback itinerary
      return this.generateFallbackItinerary(params);
    }
  }

  /**
   * Generate fallback itinerary if AI fails
   */
  private generateFallbackItinerary(
    params: ItineraryGenerationParams
  ): DailyPlan[] {
    const { startDate, endDate, budget } = params;
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const dailyBudget = budget / days;

    const plans: DailyPlan[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      plans.push({
        date,
        activities: [
          {
            name: "Morning Exploration",
            description: "Explore local attractions",
            location: { lat: 0, lon: 0, address: "City Center" },
            duration: 120,
            cost: dailyBudget * 0.3,
            category: "sightseeing",
            startTime: "09:00",
            endTime: "11:00",
          },
          {
            name: "Afternoon Activity",
            description: "Visit popular destination",
            location: { lat: 0, lon: 0, address: "Main Attraction" },
            duration: 180,
            cost: dailyBudget * 0.4,
            category: "attraction",
            startTime: "14:00",
            endTime: "17:00",
          },
        ],
        meals: [
          {
            name: "Local Breakfast",
            type: "breakfast",
            location: { lat: 0, lon: 0, address: "Near Hotel" },
            cost: dailyBudget * 0.1,
            cuisine: "local",
            time: "08:00",
          },
          {
            name: "Lunch",
            type: "lunch",
            location: { lat: 0, lon: 0, address: "City Center" },
            cost: dailyBudget * 0.15,
            cuisine: "local",
            time: "12:00",
          },
          {
            name: "Dinner",
            type: "dinner",
            location: { lat: 0, lon: 0, address: "Restaurant District" },
            cost: dailyBudget * 0.2,
            cuisine: "local",
            time: "19:00",
          },
        ],
        transportation: [
          {
            type: "walk",
            from: "Hotel",
            to: "Morning Exploration",
            duration: 15,
            cost: 0,
            time: "08:45",
          },
        ],
        estimatedCost: dailyBudget,
      });
    }

    return plans;
  }

  /**
   * Generate travel itinerary using AI
   */
  async generateItinerary(
    params: ItineraryGenerationParams
  ): Promise<DailyPlan[]> {
    const systemPrompt =
      "You are an expert travel planner. Generate detailed, realistic, and budget-conscious travel itineraries in JSON format.";
    const prompt = this.createItineraryPrompt(params);

    try {
      const response = await this.generateCompletion(prompt, systemPrompt);
      return this.parseItineraryResponse(response, params);
    } catch (error) {
      console.error("AI itinerary generation failed:", error);
      return this.generateFallbackItinerary(params);
    }
  }

  /**
   * Process chat message with context
   */
  async processChat(
    message: string,
    context: ChatContext
  ): Promise<ChatResponse> {
    const systemPrompt = `You are a helpful travel assistant. Provide concise, accurate travel advice and help users modify their travel plans.`;

    let prompt = `User message: ${message}\n\n`;

    if (context.currentPlan) {
      prompt += `Current trip plan:\n${JSON.stringify(
        context.currentPlan,
        null,
        2
      )}\n\n`;
    }

    if (context.conversationHistory && context.conversationHistory.length > 0) {
      prompt += `Previous conversation:\n`;
      context.conversationHistory.slice(-5).forEach((msg) => {
        prompt += `${msg.role}: ${msg.content}\n`;
      });
      prompt += "\n";
    }

    prompt += `Respond to the user's message. If they want to modify their plan, provide the updated plan in JSON format with an "action" field set to "update_plan".`;

    try {
      const response = await this.generateCompletion(prompt, systemPrompt);

      // Check if response contains plan update
      if (response.includes('"action"') && response.includes("update_plan")) {
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              message: parsed.message || response,
              action: "update_plan",
              updatedPlan: parsed.updatedPlan,
            };
          }
        } catch (e) {
          // If parsing fails, return as info
        }
      }

      return {
        message: response,
        action: "provide_info",
      };
    } catch (error) {
      console.error("AI chat processing failed:", error);
      return {
        message:
          "I apologize, but I encountered an error processing your request. Please try again.",
        action: "none",
      };
    }
  }

  /**
   * Optimize existing plan based on constraints
   */
  async optimizePlan(
    plan: DailyPlan[],
    constraints: {
      budget?: number;
      weather?: any;
      preferences?: TravelPreferences;
    }
  ): Promise<DailyPlan[]> {
    const systemPrompt =
      "You are an expert travel planner. Optimize travel itineraries based on constraints while maintaining the overall structure.";

    const prompt = `Optimize this travel itinerary based on the following constraints:

CURRENT ITINERARY:
${JSON.stringify(plan, null, 2)}

CONSTRAINTS:
${constraints.budget ? `- New Budget: $${constraints.budget}` : ""}
${
  constraints.weather ? `- Weather: ${JSON.stringify(constraints.weather)}` : ""
}
${
  constraints.preferences
    ? `- Preferences: ${JSON.stringify(constraints.preferences)}`
    : ""
}

Provide the optimized itinerary in the same JSON format, adjusting activities, costs, and timing as needed.`;

    try {
      const response = await this.generateCompletion(prompt, systemPrompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.itinerary) {
          return parsed.itinerary.map((day: any) => ({
            date: new Date(day.date),
            activities: day.activities || [],
            meals: day.meals || [],
            transportation: day.transportation || [],
            estimatedCost: day.estimatedCost || 0,
          }));
        }
      }

      // If optimization fails, return original plan
      return plan;
    } catch (error) {
      console.error("AI plan optimization failed:", error);
      return plan;
    }
  }
}

export const aiService = new AIService();
