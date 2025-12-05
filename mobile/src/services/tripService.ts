import api from "./api";
import { Trip, TravelPreferences } from "../types";
import { getIsOnline } from "../utils/networkStatus";
import {
  getTripsOffline,
  saveTripOffline,
  deleteTripOffline,
  addPendingSyncOperation,
} from "../utils/offlineStorage";

export interface CreateTripInput {
  userId: string;
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
    if (!getIsOnline()) {
      // Queue for sync when online
      await addPendingSyncOperation({
        type: "CREATE_TRIP",
        data: tripData,
      });

      // Create temporary offline trip
      const offlineTrip: Trip = {
        id: `offline_${Date.now()}`,
        ...tripData,
        status: "pending",
        createdAt: new Date(),
        dailyPlans: [],
      } as Trip;

      await saveTripOffline(offlineTrip);
      return offlineTrip;
    }

    const response = await api.post("/api/trips", {
      ...tripData,
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
    if (!getIsOnline()) {
      const trips = await getTripsOffline();
      const trip = trips.find((t) => t.id === tripId);
      if (!trip) {
        throw new Error("Trip not found offline");
      }
      return trip;
    }

    const response = await api.get(`/api/trips/${tripId}`);
    // Backend returns { trip }, so we need to extract the trip
    const trip = response.data.trip || response.data;
    await saveTripOffline(trip);
    return trip;
  }

  async getUserTrips(): Promise<Trip[]> {
    if (!getIsOnline()) {
      return await getTripsOffline();
    }

    try {
      const response = await api.get("/api/trips");
      // Backend returns { trips }, so we need to extract the trips array
      const trips = response.data.trips || response.data;

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
    if (!getIsOnline()) {
      await addPendingSyncOperation({
        type: "UPDATE_ACTIVITY",
        data: { activityId, updates },
      });

      // Update local data optimistically
      // This would require more complex local state management
      return { id: activityId, ...updates };
    }

    const response = await api.put(`/api/trips/activities/${activityId}`, updates);
    return response.data;
  }

  async deleteActivity(activityId: string): Promise<void> {
    if (!getIsOnline()) {
      await addPendingSyncOperation({
        type: "UPDATE_ACTIVITY",
        data: { activityId, updates: { deleted: true } },
      });
      return;
    }

    await api.delete(`/api/trips/activities/${activityId}`);
  }

  async replaceActivity(
    activityId: string,
    newActivity: UpdateActivityInput
  ): Promise<any> {
    if (!getIsOnline()) {
      throw new Error("Cannot replace activities while offline");
    }

    const response = await api.post(
      `/api/trips/activities/${activityId}/replace`,
      newActivity
    );
    return response.data;
  }

  async optimizeTrip(
    tripId: string,
    constraints: {
      budget?: number;
      preferences?: TravelPreferences;
    }
  ): Promise<Trip> {
    if (!getIsOnline()) {
      throw new Error("Cannot optimize trips while offline");
    }

    const response = await api.post(`/api/trips/${tripId}/optimize`, constraints);
    const trip = response.data;
    await saveTripOffline(trip);
    return trip;
  }

  async deleteTrip(tripId: string): Promise<void> {
    if (!getIsOnline()) {
      await addPendingSyncOperation({
        type: "DELETE_TRIP",
        data: { tripId },
      });
      await deleteTripOffline(tripId);
      return;
    }

    await api.delete(`/api/trips/${tripId}`);
    await deleteTripOffline(tripId);
  }
}

export const tripService = new TripService();
