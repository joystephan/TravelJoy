import axios from "axios";
import redisClient from "../config/redis";
import nominatimService from "./nominatimService";

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

    let prompt = `You are a local travel expert for ${destination}. Generate a detailed ${days}-day travel itinerary using REAL, SPECIFIC places in ${destination}.

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
      prompt += `\nAVAILABLE ATTRACTIONS IN ${destination}:\n${placesData
        .map((p) => `- ${p.display_name || p.name}`)
        .join("\n")}\n`;
    }

    prompt += `
CRITICAL REQUIREMENTS:
1. **USE ONLY REAL PLACES**: All activities, restaurants, and attractions MUST be real, existing places in ${destination}. DO NOT use generic names like "Historic Museum" or "Local Café".
2. **SPECIFIC NAMES REQUIRED**: 
   - Activities: Use actual attraction names (e.g., "Eiffel Tower" not "Famous Tower", "Louvre Museum" not "Art Museum")
   - Restaurants: Use real restaurant names (e.g., "Le Jules Verne" not "Fine Dining Restaurant", "Café de Flore" not "Traditional Café")
   - Addresses: Provide real street addresses in ${destination}
3. **UNIQUE PLACES**: Each day MUST have DIFFERENT activities, meals, and transportation. Do NOT repeat the same places across days.
4. **ACCURATE COORDINATES**: Provide real GPS coordinates (latitude, longitude) for each location in ${destination}
5. **BUDGET ENFORCEMENT**: The TOTAL COST across ALL ${days} days MUST NOT EXCEED $${budget}. Each day should cost approximately $${dailyBudget.toFixed(2)} or less.
6. **COMPLETE MEALS**: Include breakfast, lunch, and dinner for each day - use DIFFERENT real restaurants for each meal
7. **REALISTIC TRANSPORTATION**: Add transportation between activities using real modes available in ${destination}
8. **SCHEDULE MATCHING**: ${preferences.schedulePreference === "relaxed" ? "2-3 activities per day" : preferences.schedulePreference === "packed" ? "5+ activities per day" : "3-4 activities per day"}
9. **VERIFY BUDGET**: After creating the itinerary, sum all daily costs to ensure total ≤ $${budget}

EXAMPLES OF WHAT TO DO:
✅ GOOD: "Visit the Eiffel Tower at Champ de Mars, 5 Avenue Anatole France"
✅ GOOD: "Lunch at Le Comptoir du Relais, 9 Carrefour de l'Odéon"
✅ GOOD: "Explore the Louvre Museum, Rue de Rivoli"

EXAMPLES OF WHAT NOT TO DO:
❌ BAD: "Visit a historic museum"
❌ BAD: "Lunch at a traditional restaurant"
❌ BAD: "Explore the city center"

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
  private async parseItineraryResponse(
    response: string,
    params: ItineraryGenerationParams
  ): Promise<DailyPlan[]> {
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

      // Enforce budget constraint
      const enforcedPlans = this.enforceBudgetConstraint(dailyPlans, params.budget);

      return enforcedPlans;
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      // Return fallback itinerary
      return await this.generateFallbackItinerary(params);
    }
  }

  /**
   * Enforce budget constraint by scaling down costs if total exceeds budget
   */
  private enforceBudgetConstraint(dailyPlans: DailyPlan[], totalBudget: number): DailyPlan[] {
    // Calculate total cost
    const totalCost = dailyPlans.reduce((sum, plan) => sum + plan.estimatedCost, 0);
    
    // If within budget, return as is
    if (totalCost <= totalBudget) {
      console.log(`Budget OK: Total cost $${totalCost.toFixed(2)} ≤ Budget $${totalBudget.toFixed(2)}`);
      return dailyPlans;
    }
    
    // Calculate scaling factor to bring total within budget
    const scaleFactor = totalBudget / totalCost;
    console.log(`Budget exceeded: Total cost $${totalCost.toFixed(2)} > Budget $${totalBudget.toFixed(2)}`);
    console.log(`Scaling all costs by factor: ${scaleFactor.toFixed(3)}`);
    
    // Scale down all costs proportionally
    const adjustedPlans = dailyPlans.map(plan => {
      // Scale activities
      const scaledActivities = plan.activities.map(activity => ({
        ...activity,
        cost: Math.round(activity.cost * scaleFactor * 100) / 100, // Round to 2 decimals
      }));
      
      // Scale meals
      const scaledMeals = plan.meals.map(meal => ({
        ...meal,
        cost: Math.round(meal.cost * scaleFactor * 100) / 100,
      }));
      
      // Scale transportation
      const scaledTransportation = plan.transportation.map(transport => ({
        ...transport,
        cost: Math.round(transport.cost * scaleFactor * 100) / 100,
      }));
      
      // Recalculate estimated cost
      const newEstimatedCost = 
        scaledActivities.reduce((sum, a) => sum + a.cost, 0) +
        scaledMeals.reduce((sum, m) => sum + m.cost, 0) +
        scaledTransportation.reduce((sum, t) => sum + t.cost, 0);
      
      return {
        ...plan,
        activities: scaledActivities,
        meals: scaledMeals,
        transportation: scaledTransportation,
        estimatedCost: Math.round(newEstimatedCost * 100) / 100,
      };
    });
    
    const newTotalCost = adjustedPlans.reduce((sum, plan) => sum + plan.estimatedCost, 0);
    console.log(`Budget enforced: New total cost $${newTotalCost.toFixed(2)} ≤ Budget $${totalBudget.toFixed(2)}`);
    
    return adjustedPlans;
  }

  /**
   * Generate fallback itinerary if AI fails - using REAL places from LocationIQ
   */
  private async generateFallbackItinerary(
    params: ItineraryGenerationParams
  ): Promise<DailyPlan[]> {
    const { startDate, endDate, budget, destination, placesData } = params;
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const dailyBudget = budget / days;

    console.log(`🔄 Generating fallback itinerary with REAL places for ${destination}...`);

    // Fetch REAL attractions and restaurants from LocationIQ
    let realAttractions: any[] = [];
    let realRestaurants: any[] = [];
    
    try {
      console.log(`🔍 Fetching real attractions in ${destination}...`);
      realAttractions = await nominatimService.searchAttractions(destination, 30);
      console.log(`✅ Found ${realAttractions.length} real attractions`);
      
      console.log(`🔍 Fetching real restaurants in ${destination}...`);
      realRestaurants = await nominatimService.searchRestaurants(destination, 30);
      console.log(`✅ Found ${realRestaurants.length} real restaurants`);
    } catch (error) {
      console.error("⚠️ Failed to fetch real places, will use generic fallback:", error);
    }

    // Get destination coordinates from placesData or use default
    let baseLat = 0;
    let baseLon = 0;
    if (placesData && placesData.length > 0 && placesData[0].coordinates) {
      baseLat = placesData[0].coordinates.lat;
      baseLon = placesData[0].coordinates.lon;
    } else if (realAttractions.length > 0) {
      baseLat = realAttractions[0].coordinates.lat;
      baseLon = realAttractions[0].coordinates.lon;
    }

    // Helper function to get a real place or generate a generic one
    const getActivity = (index: number) => {
      if (realAttractions.length > index) {
        const place = realAttractions[index];
        return {
          name: place.name || place.displayName.split(',')[0],
          description: `Visit ${place.name || place.displayName.split(',')[0]}`,
          location: {
            lat: place.coordinates.lat,
            lon: place.coordinates.lon,
            address: place.displayName,
          },
          category: place.type || "attraction",
        };
      }
      // Fallback to generic if not enough real places
      const genericActivities = [
        { name: `${destination} National Museum`, description: "Explore local history and culture", category: "museum" },
        { name: `${destination} City Center`, description: "Stroll through the main streets", category: "sightseeing" },
        { name: `${destination} Art Gallery`, description: "Discover local art", category: "art" },
        { name: `${destination} Central Park`, description: "Relax in nature", category: "nature" },
        { name: `${destination} Main Market`, description: "Experience local shopping", category: "shopping" },
      ];
      const generic = genericActivities[index % genericActivities.length];
      return {
        ...generic,
        location: { lat: baseLat, lon: baseLon, address: `${destination} City Center` },
      };
    };

    const getRestaurant = (index: number, mealType: string) => {
      if (realRestaurants.length > index) {
        const place = realRestaurants[index];
        return {
          name: place.name || place.displayName.split(',')[0],
          location: {
            lat: place.coordinates.lat,
            lon: place.coordinates.lon,
            address: place.displayName,
          },
          cuisine: place.type || "local",
        };
      }
      // Fallback to generic if not enough real places
      const genericNames = {
        breakfast: [`Café ${destination}`, `${destination} Bakery`, `Morning Spot`],
        lunch: [`${destination} Bistro`, `Local Restaurant`, `${destination} Eatery`],
        dinner: [`Fine Dining ${destination}`, `${destination} Traditional`, `Rooftop Restaurant`],
      };
      const names = genericNames[mealType as keyof typeof genericNames] || genericNames.lunch;
      return {
        name: names[index % names.length],
        location: { lat: baseLat, lon: baseLon, address: `${destination} City Center` },
        cuisine: "local",
      };
    };

    // Different transportation modes
    const transportModes = ["walk", "taxi", "bus", "train", "walk", "taxi", "bus", "walk"];

    const plans: DailyPlan[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      // Get REAL activities for this day (2 activities per day)
      const activity1 = getActivity(i * 2);
      const activity2 = getActivity(i * 2 + 1);
      
      const activities = [
        {
          name: activity1.name,
          description: activity1.description,
          location: activity1.location,
          duration: 120,
          cost: 25, // Realistic museum/attraction entry fee
          category: activity1.category,
          startTime: "09:00",
          endTime: "11:00",
        },
        {
          name: activity2.name,
          description: activity2.description,
          location: activity2.location,
          duration: 180,
          cost: 35, // Realistic tour/activity cost
          category: activity2.category,
          startTime: "14:00",
          endTime: "17:00",
        },
      ];

      // Get REAL restaurants for this day (3 meals per day)
      const breakfast = getRestaurant(i * 3, "breakfast");
      const lunch = getRestaurant(i * 3 + 1, "lunch");
      const dinner = getRestaurant(i * 3 + 2, "dinner");
      
      const meals = [
        {
          name: breakfast.name,
          type: "breakfast" as const,
          location: breakfast.location,
          cost: 10, // Realistic breakfast cost
          cuisine: breakfast.cuisine,
          time: "08:00",
        },
        {
          name: lunch.name,
          type: "lunch" as const,
          location: lunch.location,
          cost: 15, // Realistic lunch cost
          cuisine: lunch.cuisine,
          time: "12:30",
        },
        {
          name: dinner.name,
          type: "dinner" as const,
          location: dinner.location,
          cost: 25, // Realistic dinner cost
          cuisine: dinner.cuisine,
          time: "19:00",
        },
      ];

      // Generate transportation for each day
      const transportMode = transportModes[i % transportModes.length];
      
      // Use activity coordinates for transportation
      const fromLat = i === 0 ? baseLat : activities[0].location.lat;
      const fromLon = i === 0 ? baseLon : activities[0].location.lon;
      const fromAddress = i === 0 ? `${destination} Hotel Area` : activities[0].location.address;
      
      const toLat = activities[0].location.lat;
      const toLon = activities[0].location.lon;
      const toAddress = activities[0].location.address;
      
      // Generate transportation with realistic fixed costs
      const transportCost = transportMode === "walk" ? 0 : 
                           transportMode === "taxi" ? 15 : 
                           transportMode === "bus" ? 3 : 
                           5; // train/other
      
      const transportation = [
        {
          type: transportMode as "walk" | "taxi" | "bus" | "train" | "car",
          from: i === 0 ? "Hotel" : "Previous Location",
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
          cost: transportCost,
          time: "08:45",
        },
      ];

      // Calculate actual estimated cost from activities, meals, and transportation
      const actualCost = 
        activities.reduce((sum, a) => sum + a.cost, 0) +
        meals.reduce((sum, m) => sum + m.cost, 0) +
        transportation.reduce((sum, t) => sum + t.cost, 0);

      console.log(`Day ${i + 1} fallback costs:`, {
        activities: activities.reduce((sum, a) => sum + a.cost, 0),
        meals: meals.reduce((sum, m) => sum + m.cost, 0),
        transportation: transportation.reduce((sum, t) => sum + t.cost, 0),
        total: actualCost,
        dailyBudget,
      });

      plans.push({
        date,
        activities,
        meals,
        transportation,
        estimatedCost: actualCost,
      });
    }

    const totalBeforeEnforcement = plans.reduce((sum, p) => sum + p.estimatedCost, 0);
    console.log(`Fallback itinerary BEFORE enforcement:`, {
      totalCost: totalBeforeEnforcement,
      budget,
      overBudget: totalBeforeEnforcement > budget,
      dailyBreakdown: plans.map((p, i) => ({ day: i + 1, cost: p.estimatedCost })),
    });

    // Apply budget enforcement to fallback itinerary too
    const enforcedPlans = this.enforceBudgetConstraint(plans, budget);
    
    const totalAfterEnforcement = enforcedPlans.reduce((sum, p) => sum + p.estimatedCost, 0);
    console.log(`Fallback itinerary AFTER enforcement:`, {
      totalCost: totalAfterEnforcement,
      budget,
      withinBudget: totalAfterEnforcement <= budget,
      dailyBreakdown: enforcedPlans.map((p, i) => ({ day: i + 1, cost: p.estimatedCost })),
    });

    return enforcedPlans;
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
      return await this.parseItineraryResponse(response, params);
    } catch (error) {
      console.error("AI itinerary generation failed:", error);
      return await this.generateFallbackItinerary(params);
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
