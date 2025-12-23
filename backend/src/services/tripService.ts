import { aiService, ItineraryGenerationParams, DailyPlan } from "./aiService";
import weatherService from "./weatherService";
import nominatimService from "./nominatimService";
import prisma from "../config/database";

export interface TripInput {
  userId: string;
  destination: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  preferences?: {
    activityType?: string[];
    foodPreference?: string[];
    transportPreference?: string[];
    schedulePreference?: "relaxed" | "moderate" | "packed";
  };
}

export interface ActivityUpdate {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  duration?: number;
  cost?: number;
  category?: string;
}

class TripService {
  /**
   * Create a new trip with AI-generated itinerary
   */
  async createTrip(tripData: TripInput) {
    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: tripData.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create trip record
    const trip = await prisma.trip.create({
      data: {
        userId: tripData.userId,
        destination: tripData.destination,
        budget: tripData.budget,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        status: "generating",
      },
    });

    // Generate itinerary asynchronously (don't block the response)
    this.generateItineraryForTrip(trip.id, tripData).catch(async (error) => {
      console.error(`Failed to generate itinerary for trip ${trip.id}:`, error);
      // Update trip status to failed
      try {
        await prisma.trip.update({
          where: { id: trip.id },
          data: { status: "failed" },
        });
      } catch (updateError) {
        console.error(`Failed to update trip status to failed:`, updateError);
      }
    });

    return trip;
  }

  /**
   * Generate itinerary for a trip using AI
   */
  async generateItineraryForTrip(tripId: string, tripData: TripInput) {
    try {
      // Get destination coordinates
      const locationResults = await nominatimService.searchPlaces(
        tripData.destination
      );
      if (!locationResults || locationResults.length === 0) {
        throw new Error("Destination not found");
      }

      const location = locationResults[0];
      const coordinates = location.coordinates;

      // Get weather data for the trip dates
      let weatherData;
      try {
        weatherData = await weatherService.getForecast(coordinates);
      } catch (error) {
        console.warn("Failed to fetch weather data:", error);
      }

      // Search for places of interest
      let placesData;
      try {
        placesData = await nominatimService.searchPlaces(
          `attractions in ${tripData.destination}`
        );
      } catch (error) {
        console.warn("Failed to fetch places data:", error);
      }

      // Prepare AI generation parameters
      const aiParams: ItineraryGenerationParams = {
        destination: tripData.destination,
        budget: tripData.budget,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        preferences: tripData.preferences || {},
        weatherData,
        placesData,
      };

      // Generate itinerary using AI
      const dailyPlans = await aiService.generateItinerary(aiParams);

      // Save itinerary to database
      await this.saveDailyPlans(tripId, dailyPlans);

      // Update trip status
      await prisma.trip.update({
        where: { id: tripId },
        data: { status: "completed" },
      });

      return dailyPlans;
    } catch (error) {
      console.error("Itinerary generation failed:", error);
      await prisma.trip.update({
        where: { id: tripId },
        data: { status: "failed" },
      });
      throw error;
    }
  }

  /**
   * Save daily plans to database
   */
  private async saveDailyPlans(tripId: string, dailyPlans: DailyPlan[]) {
    for (const plan of dailyPlans) {
      const dailyPlan = await prisma.dailyPlan.create({
        data: {
          tripId,
          date: plan.date,
          estimatedCost: plan.estimatedCost,
        },
      });

      // Save activities
      if (plan.activities && plan.activities.length > 0) {
        await prisma.activity.createMany({
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
        await prisma.meal.createMany({
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
        await prisma.transportation.createMany({
          data: plan.transportation.map((transport) => ({
            dailyPlanId: dailyPlan.id,
            fromLocation: transport.from,
            toLocation: transport.to,
            fromLatitude: transport.fromLocation?.lat || 0,
            fromLongitude: transport.fromLocation?.lon || 0,
            toLatitude: transport.toLocation?.lat || 0,
            toLongitude: transport.toLocation?.lon || 0,
            mode: transport.type,
            duration: transport.duration,
            cost: transport.cost,
          })),
        });
      }
    }
  }

  /**
   * Check if all daily plans have identical content (old trip format)
   */
  private hasIdenticalContent(dailyPlans: any[]): boolean {
    if (!dailyPlans || dailyPlans.length <= 1) {
      return false;
    }

    // Get the first day's content as reference
    const firstDay = dailyPlans[0];
    const firstActivityNames = (firstDay.activities || []).map((a: any) => a.name).sort().join(',');
    const firstMealNames = (firstDay.meals || []).map((m: any) => m.name).sort().join(',');
    const firstTransportTypes = (firstDay.transportations || []).map((t: any) => t.mode || t.type).sort().join(',');

    // Check if all other days have the same content
    for (let i = 1; i < dailyPlans.length; i++) {
      const day = dailyPlans[i];
      const activityNames = (day.activities || []).map((a: any) => a.name).sort().join(',');
      const mealNames = (day.meals || []).map((m: any) => m.name).sort().join(',');
      const transportTypes = (day.transportations || []).map((t: any) => t.mode || t.type).sort().join(',');

      if (activityNames !== firstActivityNames || 
          mealNames !== firstMealNames || 
          transportTypes !== firstTransportTypes) {
        return false; // Found different content, not identical
      }
    }

    return true; // All days have identical content
  }

  /**
   * Regenerate itinerary for an existing trip
   */
  private async regenerateItineraryForTrip(trip: any): Promise<void> {
    console.log(`Regenerating itinerary for trip ${trip.id} (old trip with identical content)`);
    
    // Get destination coordinates (with error handling)
    let locationResults;
    try {
      locationResults = await nominatimService.searchPlaces(trip.destination);
      if (!locationResults || locationResults.length === 0) {
        throw new Error(`Could not find location for ${trip.destination}`);
      }
    } catch (error) {
      console.error(`Failed to get location for regeneration:`, error);
      throw new Error(`Failed to regenerate: Could not find destination location`);
    }

    const location = locationResults[0];
    const coordinates = location.coordinates;

    // Get weather data (optional, don't fail if it fails)
    let weatherData;
    try {
      weatherData = await weatherService.getForecast(coordinates);
    } catch (error) {
      console.warn("Failed to fetch weather data for regeneration (continuing anyway):", error);
      // Continue without weather data
    }

    // Prepare AI generation parameters
    const aiParams: ItineraryGenerationParams = {
      destination: trip.destination,
      budget: trip.budget,
      startDate: new Date(trip.startDate),
      endDate: new Date(trip.endDate),
      preferences: trip.preferences || {},
      weatherData,
      placesData: locationResults,
    };

    // Generate new itinerary using AI (will use updated fallback if AI fails)
    let dailyPlans;
    try {
      dailyPlans = await aiService.generateItinerary(aiParams);
      if (!dailyPlans || dailyPlans.length === 0) {
        throw new Error("Generated itinerary is empty");
      }
    } catch (error) {
      console.error(`Failed to generate itinerary:`, error);
      throw new Error(`Failed to regenerate: Could not generate new itinerary`);
    }

    // Delete old daily plans and their related data (cascade delete will handle related records)
    try {
      await prisma.dailyPlan.deleteMany({
        where: { tripId: trip.id },
      });
    } catch (error) {
      console.error(`Failed to delete old daily plans:`, error);
      throw new Error(`Failed to regenerate: Could not delete old plans`);
    }

    // Save new daily plans
    try {
      await this.saveDailyPlans(trip.id, dailyPlans);
      console.log(`Successfully regenerated itinerary for trip ${trip.id} with ${dailyPlans.length} days`);
    } catch (error) {
      console.error(`Failed to save new daily plans:`, error);
      throw new Error(`Failed to regenerate: Could not save new plans`);
    }
  }

  /**
   * Get trip by ID with full itinerary
   * Automatically regenerates old trips with identical content
   */
  async getTripById(tripId: string) {
    const trip = await prisma.trip.findUnique({
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

    // Check if this is an old trip with identical content across all days
    if (trip.dailyPlans && trip.dailyPlans.length > 1) {
      const hasIdentical = this.hasIdenticalContent(trip.dailyPlans);
      
      if (hasIdentical) {
        console.log(`Detected old trip ${tripId} with identical content, scheduling background regeneration...`);
        
        // Regenerate in the background (non-blocking)
        // This ensures the API responds immediately without timeout
        // The next time the user loads this trip, they'll get the regenerated version
        this.regenerateItineraryForTrip(trip).catch((error) => {
          console.error(`Background regeneration failed for trip ${tripId}:`, error);
          // Don't throw - regeneration failure shouldn't affect the current request
        });
        
        // Return the original trip immediately (non-blocking)
        // User will see old content this time, but next load will have new content
      }
    }

    return trip;
  }

  /**
   * Get all trips for a user
   */
  async getUserTrips(userId: string) {
    return prisma.trip.findMany({
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
  async updateActivity(activityId: string, updates: ActivityUpdate) {
    return prisma.activity.update({
      where: { id: activityId },
      data: updates,
    });
  }

  /**
   * Delete an activity from the itinerary
   */
  async deleteActivity(activityId: string) {
    return prisma.activity.delete({
      where: { id: activityId },
    });
  }

  /**
   * Replace an activity with an alternative
   */
  async replaceActivity(
    activityId: string,
    newActivity: Omit<ActivityUpdate, "id">
  ) {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new Error("Activity not found");
    }

    return prisma.activity.update({
      where: { id: activityId },
      data: {
        ...newActivity,
      },
    });
  }

  /**
   * Update a meal in the itinerary
   */
  async updateMeal(mealId: string, updates: Partial<{
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    mealType: string;
    cost: number;
    cuisine: string;
    rating: number;
    imageUrl: string;
  }>) {
    return prisma.meal.update({
      where: { id: mealId },
      data: updates,
    });
  }

  /**
   * Delete a meal from the itinerary
   */
  async deleteMeal(mealId: string) {
    return prisma.meal.delete({
      where: { id: mealId },
    });
  }

  /**
   * Optimize existing trip based on new constraints
   */
  async optimizeTrip(
    tripId: string,
    constraints: {
      budget?: number;
      preferences?: any;
    }
  ) {
    const trip = await this.getTripById(tripId);

    // Convert database format to DailyPlan format
    const currentPlans: DailyPlan[] = trip.dailyPlans.map((dp) => ({
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

    // Get weather data if needed
    let weatherData;
    if (trip.destination) {
      try {
        const locationResults = await nominatimService.searchPlaces(
          trip.destination
        );
        if (locationResults && locationResults.length > 0) {
          const location = locationResults[0];
          weatherData = await weatherService.getForecast(location.coordinates);
        }
      } catch (error) {
        console.warn("Failed to fetch weather data for optimization:", error);
      }
    }

    // Optimize using AI
    const optimizedPlans = await aiService.optimizePlan(currentPlans, {
      budget: constraints.budget,
      weather: weatherData,
      preferences: constraints.preferences,
    });

    // Delete existing daily plans
    await prisma.dailyPlan.deleteMany({
      where: { tripId },
    });

    // Save optimized plans
    await this.saveDailyPlans(tripId, optimizedPlans);

    // Update trip budget if provided
    if (constraints.budget) {
      await prisma.trip.update({
        where: { id: tripId },
        data: { budget: constraints.budget },
      });
    }

    return this.getTripById(tripId);
  }

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string) {
    return prisma.trip.delete({
      where: { id: tripId },
    });
  }
}

export const tripService = new TripService();
