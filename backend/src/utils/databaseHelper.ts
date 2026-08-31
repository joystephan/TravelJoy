import prisma from "../config/database";
import { DailyPlan } from "../services/aiService";

/**
 * Database helper utility to avoid duplication in services
 * Provides consistent database operations
 */

/**
 * Save daily plans to database
 * Used by tripService and chatService
 * @param tripId Trip ID
 * @param dailyPlans Array of daily plans to save
 */
export async function saveDailyPlans(
  tripId: string,
  dailyPlans: DailyPlan[]
): Promise<void> {
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
 * Delete all daily plans for a trip
 * @param tripId Trip ID
 */
export async function deleteDailyPlans(tripId: string): Promise<void> {
  await prisma.dailyPlan.deleteMany({
    where: { tripId },
  });
}

