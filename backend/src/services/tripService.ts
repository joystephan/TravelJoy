import { PrismaClient } from "@prisma/client";
import { aiService, ItineraryGenerationParams, DailyPlan } from "./aiService";
import weatherService from "./weatherService";
import nominatimService from "./nominatimService";

const prisma = new PrismaClient();

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
    // Validate user subscription and trip limits
    const user = await prisma.user.findUnique({
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

    // Generate itinerary asynchronously
    this.generateItineraryForTrip(trip.id, tripData).catch((error) => {
      console.error(`Failed to generate itinerary for trip ${trip.id}:`, error);
      // Update trip status to failed
      prisma.trip.update({
        where: { id: trip.id },
        data: { status: "failed" },
      });
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
