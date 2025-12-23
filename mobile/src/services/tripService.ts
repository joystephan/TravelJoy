import api from "./api";
import { Trip, TravelPreferences } from "../types";
import {
  getTripsOffline,
  saveTripOffline,
  deleteTripOffline,
} from "../utils/offlineStorage";
import { requireOnline, queueForSync, isOnline } from "../utils/offlineHelper";

export interface CreateTripInput {
  destination: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  preferences?: TravelPreferences;
}

export interface UpdateActivityInput {
  name?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  duration?: number;
  cost?: number;
  category?: string;
}

class TripService {
  async createTrip(tripData: CreateTripInput): Promise<Trip> {
    if (!isOnline()) {
      // Queue for sync when online
      await queueForSync("CREATE_TRIP", tripData);

      // Create temporary offline trip
      const offlineTrip: Trip = {
        id: `offline_${Date.now()}`,
        destination: tripData.destination,
        budget: tripData.budget,
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        status: "pending",
        createdAt: new Date(),
        dailyPlans: [],
      } as Trip;

      await saveTripOffline(offlineTrip);
      return offlineTrip;
    }

    const response = await api.post("/api/trips", {
      destination: tripData.destination,
      budget: tripData.budget,
      startDate: tripData.startDate.toISOString(),
      endDate: tripData.endDate.toISOString(),
      preferences: {
        activityType: tripData.preferences?.activityType || [],
        foodPreference: tripData.preferences?.foodPreference || [],
        transportPreference: tripData.preferences?.transportPreference || [],
        schedulePreference:
          tripData.preferences?.schedulePreference || "moderate",
      },
    });

    // Backend returns { message, trip }, so we need to extract the trip
    const trip = response.data.trip || response.data;
    await saveTripOffline(trip);
    return trip;
  }

  async getTripById(tripId: string): Promise<Trip> {
    if (!isOnline()) {
      const trips = await getTripsOffline();
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error("Trip not found offline");
      }
      return trip;
    }

    const response = await api.get(`/api/trips/${tripId}`);
    // Backend returns { trip }, so extract it
    const trip = response.data.trip || response.data;
    await saveTripOffline(trip);
    return trip;
  }

  async getUserTrips(): Promise<Trip[]> {
    if (!isOnline()) {
      return await getTripsOffline();
    }

    try {
      const response = await api.get("/api/trips");
      // Backend returns { trips }, so extract it
      const trips = response.data.trips || response.data || [];

      // Update offline storage
      for (const trip of trips) {
        await saveTripOffline(trip);
      }

      return trips;
    } catch (error) {
      // Fallback to offline data
      console.warn("Failed to fetch trips online, using offline data");
      return await getTripsOffline();
    }
  }

  async updateActivity(
    activityId: string,
    updates: UpdateActivityInput
  ): Promise<any> {
    if (!isOnline()) {
      await queueForSync("UPDATE_ACTIVITY", { activityId, updates });

      // Update local data optimistically
      // This would require more complex local state management
      return { id: activityId, ...updates };
    }

    const response = await api.put(`/api/trips/activities/${activityId}`, updates);
    return response.data;
  }

  async deleteActivity(activityId: string): Promise<void> {
    if (!isOnline()) {
      await queueForSync("UPDATE_ACTIVITY", { activityId, updates: { deleted: true } });
      return;
    }

    await api.delete(`/api/trips/activities/${activityId}`);
  }

  async replaceActivity(
    activityId: string,
    newActivity: UpdateActivityInput
  ): Promise<any> {
    requireOnline("replace activities");

    const response = await api.post(
      `/api/trips/activities/${activityId}/replace`,
      newActivity
    );
    return response.data;
  }

  async updateMeal(
    mealId: string,
    updates: Partial<{
      name: string;
      description: string;
      latitude: number;
      longitude: number;
      mealType: string;
      cost: number;
      cuisine: string;
      rating: number;
      imageUrl: string;
    }>
  ): Promise<any> {
    if (!isOnline()) {
      await queueForSync("UPDATE_MEAL", { mealId, updates });

      // Update local data optimistically
      return { id: mealId, ...updates };
    }

    const response = await api.put(`/api/trips/meals/${mealId}`, updates);
    return response.data;
  }

  async deleteMeal(mealId: string): Promise<void> {
    if (!isOnline()) {
      await queueForSync("DELETE_MEAL", { mealId });
      return;
    }

    await api.delete(`/api/trips/meals/${mealId}`);
  }

  async optimizeTrip(
    tripId: string,
    constraints: {
      budget?: number;
      preferences?: TravelPreferences;
    }
  ): Promise<Trip> {
    requireOnline("optimize trips");

    const response = await api.post(`/api/trips/${tripId}/optimize`, constraints);
    const trip = response.data;
    await saveTripOffline(trip);
    return trip;
  }

  async deleteTrip(tripId: string): Promise<void> {
    if (!isOnline()) {
      await queueForSync("DELETE_TRIP", { tripId });
      await deleteTripOffline(tripId);
      return;
    }

    await api.delete(`/api/trips/${tripId}`);
    await deleteTripOffline(tripId);
  }
}

export const tripService = new TripService();
