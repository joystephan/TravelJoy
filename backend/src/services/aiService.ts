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
  fromLocation?: {
    lat: number;
    lon: number;
    address: string;
  };
  toLocation?: {
    lat: number;
    lon: number;
    address: string;
  };
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
2. **CRITICAL: Each day MUST have DIFFERENT activities, meals, and transportation. Do NOT repeat the same activities or restaurant names across days.**
3. Include estimated costs for each item
4. Consider opening hours and optimal visiting times
5. Balance the daily budget across all days
6. Include breakfast, lunch, and dinner for each day - use DIFFERENT restaurants for each day
7. Add transportation between activities - vary the transportation modes across days
8. Consider weather conditions if provided
9. Match the schedule preference (relaxed = 2-3 activities/day, moderate = 3-4, packed = 5+)
10. **Each day should explore different areas, visit different attractions, and try different restaurants. Make each day unique!**

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
    const { startDate, endDate, budget, destination, placesData } = params;
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const dailyBudget = budget / days;

    // Get destination coordinates from placesData or use default
    let baseLat = 0;
    let baseLon = 0;
    if (placesData && placesData.length > 0 && placesData[0].coordinates) {
      baseLat = placesData[0].coordinates.lat;
      baseLon = placesData[0].coordinates.lon;
    }

    // Helper function to generate coordinates with variation
    const getCoordinatesWithVariation = (index: number, offset: number = 0.01) => {
      if (baseLat === 0 && baseLon === 0) {
        // If no base coordinates, return 0,0 (will be handled by frontend)
        return { lat: 0, lon: 0 };
      }
      // Add small random variations to create different locations within the city
      const latVariation = (Math.sin(index) * offset) + (Math.random() * 0.005 - 0.0025);
      const lonVariation = (Math.cos(index) * offset) + (Math.random() * 0.005 - 0.0025);
      return {
        lat: baseLat + latVariation,
        lon: baseLon + lonVariation,
      };
    };

    // Different activity types for variety across days
    const activityTypes = [
      { name: "Historic Museum Tour", description: "Explore local history and culture", category: "museum" },
      { name: "City Center Walk", description: "Stroll through the main streets and squares", category: "sightseeing" },
      { name: "Art Gallery Visit", description: "Discover local art and exhibitions", category: "art" },
      { name: "Park & Gardens", description: "Relax in beautiful parks and gardens", category: "nature" },
      { name: "Local Market", description: "Experience local markets and shopping", category: "shopping" },
      { name: "Landmark Tour", description: "Visit famous landmarks and monuments", category: "landmark" },
      { name: "Cultural District", description: "Explore cultural neighborhoods", category: "culture" },
      { name: "Waterfront Walk", description: "Enjoy scenic waterfront views", category: "sightseeing" },
    ];

    // Different meal options for variety
    const breakfastOptions = [
      { name: "Traditional Café", cuisine: "local" },
      { name: "Bakery & Pastries", cuisine: "french" },
      { name: "Local Breakfast Spot", cuisine: "local" },
      { name: "Market Fresh Breakfast", cuisine: "organic" },
      { name: "Historic Café", cuisine: "local" },
      { name: "Riverside Café", cuisine: "continental" },
      { name: "Artisan Bakery", cuisine: "artisan" },
      { name: "Morning Market Eatery", cuisine: "local" },
    ];

    const lunchOptions = [
      { name: "Local Bistro", cuisine: "french" },
      { name: "Street Food Market", cuisine: "street food" },
      { name: "Traditional Restaurant", cuisine: "local" },
      { name: "Garden Café", cuisine: "vegetarian" },
      { name: "Seaside Restaurant", cuisine: "seafood" },
      { name: "Historic Tavern", cuisine: "traditional" },
      { name: "Modern Bistro", cuisine: "fusion" },
      { name: "Local Delicatessen", cuisine: "local" },
    ];

    const dinnerOptions = [
      { name: "Fine Dining Restaurant", cuisine: "fine dining" },
      { name: "Traditional Cuisine", cuisine: "local" },
      { name: "Rooftop Restaurant", cuisine: "international" },
      { name: "Historic Restaurant", cuisine: "traditional" },
      { name: "Seafood Restaurant", cuisine: "seafood" },
      { name: "Wine Bar & Bistro", cuisine: "french" },
      { name: "Gourmet Restaurant", cuisine: "gourmet" },
      { name: "Local Favorite", cuisine: "local" },
    ];

    // Different transportation modes
    const transportModes = ["walk", "taxi", "bus", "train", "walk", "taxi", "bus", "walk"];

    const plans: DailyPlan[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Select different activities, meals, and transport for each day
      const activityType = activityTypes[i % activityTypes.length];
      const breakfast = breakfastOptions[i % breakfastOptions.length];
      const lunch = lunchOptions[i % lunchOptions.length];
      const dinner = dinnerOptions[i % dinnerOptions.length];
      const transportMode = transportModes[i % transportModes.length];

      // Generate different activities for each day
      const activity1Coords = getCoordinatesWithVariation(i * 2, 0.015);
      const activity2Coords = getCoordinatesWithVariation(i * 2 + 1, 0.02);
      
      const activities = [
        {
          name: activityType.name,
          description: `${activityType.description} in ${destination}`,
          location: { 
            lat: activity1Coords.lat, 
            lon: activity1Coords.lon, 
            address: `${destination} City Center` 
          },
          duration: 120 + (i * 15), // Vary duration by day
          cost: dailyBudget * (0.3 + (i * 0.02)), // Vary cost slightly
          category: activityType.category,
          startTime: "09:00",
          endTime: "11:00",
        },
        {
          name: `${i === 0 ? "City" : i === 1 ? "Historic" : i === 2 ? "Cultural" : i === 3 ? "Artistic" : i === 4 ? "Scenic" : i === 5 ? "Local" : i === 6 ? "Famous" : "Hidden"} ${i < 3 ? "District" : i < 6 ? "Attraction" : "Gem"} Tour`,
          description: `Discover ${i === 0 ? "the heart" : i === 1 ? "historic sites" : i === 2 ? "cultural heritage" : i === 3 ? "art scene" : i === 4 ? "scenic views" : i === 5 ? "local life" : i === 6 ? "famous landmarks" : "hidden gems"} of ${destination}`,
          location: { 
            lat: activity2Coords.lat, 
            lon: activity2Coords.lon, 
            address: `${destination} ${i === 0 ? "Downtown" : i === 1 ? "Old Town" : i === 2 ? "Cultural Quarter" : i === 3 ? "Arts District" : i === 4 ? "Scenic Area" : i === 5 ? "Local Neighborhood" : i === 6 ? "Historic Center" : "Hidden Spot"}` 
          },
          duration: 180 + (i * 10),
          cost: dailyBudget * (0.4 - (i * 0.01)),
          category: i < 2 ? "sightseeing" : i < 4 ? "culture" : i < 6 ? "attraction" : "landmark",
          startTime: "14:00",
          endTime: "17:00",
        },
      ];

      // Generate different meals for each day
      const breakfastCoords = getCoordinatesWithVariation(i * 3, 0.01);
      const lunchCoords = getCoordinatesWithVariation(i * 3 + 1, 0.012);
      const dinnerCoords = getCoordinatesWithVariation(i * 3 + 2, 0.014);
      
      const meals = [
        {
          name: breakfast.name,
          type: "breakfast" as const,
          location: { 
            lat: breakfastCoords.lat, 
            lon: breakfastCoords.lon, 
            address: `${destination} City Center` 
          },
          cost: dailyBudget * (0.1 + (i * 0.005)),
          cuisine: breakfast.cuisine,
          time: "08:00",
        },
        {
          name: lunch.name,
          type: "lunch" as const,
          location: { 
            lat: lunchCoords.lat, 
            lon: lunchCoords.lon, 
            address: `${destination} ${i < 3 ? "Downtown" : "Historic District"}` 
          },
          cost: dailyBudget * (0.15 + (i * 0.005)),
          cuisine: lunch.cuisine,
          time: "12:30",
        },
        {
          name: dinner.name,
          type: "dinner" as const,
          location: { 
            lat: dinnerCoords.lat, 
            lon: dinnerCoords.lon, 
            address: `${destination} ${i < 4 ? "Restaurant District" : "Historic Quarter"}` 
          },
          cost: dailyBudget * (0.2 + (i * 0.01)),
          cuisine: dinner.cuisine,
          time: "19:00",
        },
      ];

      // Generate different transportation for each day
      // Use activity coordinates for transportation (from previous activity to next)
      let fromLat: number;
      let fromLon: number;
      let fromAddress: string;
      
      if (i === 0) {
        // First day: from hotel (use slightly different coordinates)
        const hotelCoords = getCoordinatesWithVariation(i * 4, 0.008);
        fromLat = hotelCoords.lat;
        fromLon = hotelCoords.lon;
        fromAddress = `${destination} Hotel Area`;
      } else {
        // Other days: from previous activity
        fromLat = activities[0].location.lat;
        fromLon = activities[0].location.lon;
        fromAddress = activities[0].location.address;
      }
      
      // To location is always the first activity of the day
      const toLat = activities[0].location.lat;
      const toLon = activities[0].location.lon;
      const toAddress = activities[0].location.address;
      
      const transportation = [
        {
          type: transportMode as "walk" | "taxi" | "bus" | "train" | "car",
          from: i === 0 ? "Hotel" : i === 1 ? "Previous Location" : `Day ${i} Activity`,
          to: activities[0].name,
          fromLocation: {
            lat: fromLat,
            lon: fromLon,
            address: fromAddress,
          },
          toLocation: {
            lat: toLat,
            lon: toLon,
            address: toAddress,
          },
          duration: transportMode === "walk" ? 15 : transportMode === "taxi" ? 10 : transportMode === "bus" ? 20 : 25,
          cost: transportMode === "walk" ? 0 : transportMode === "taxi" ? 15 : transportMode === "bus" ? 3 : 5,
          time: "08:45",
        },
      ];

      plans.push({
        date,
        activities,
        meals,
        transportation,
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
