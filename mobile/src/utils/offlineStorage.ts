import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trip } from "../types";

const STORAGE_KEYS = {
  TRIPS: "offline_trips",
  PENDING_SYNC: "pending_sync_operations",
  LAST_SYNC: "last_sync_timestamp",
};

export interface PendingSyncOperation {
  id: string;
  type: "CREATE_TRIP" | "UPDATE_TRIP" | "DELETE_TRIP" | "UPDATE_ACTIVITY";
  data: any;
  timestamp: number;
}

/**
 * Save trip data to local storage
 */
export async function saveTripsOffline(trips: Trip[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TRIPS, JSON.stringify(trips));
  } catch (error) {
    console.error("Failed to save trips offline:", error);
    throw error;
  }
}

/**
 * Get trips from local storage
 */
export async function getTripsOffline(): Promise<Trip[]> {
  try {
    const tripsJson = await AsyncStorage.getItem(STORAGE_KEYS.TRIPS);
    return tripsJson ? JSON.parse(tripsJson) : [];
  } catch (error) {
    console.error("Failed to get trips offline:", error);
    return [];
  }
}

/**
 * Save a single trip to local storage
 */
export async function saveTripOffline(trip: Trip): Promise<void> {
  try {
    const trips = await getTripsOffline();
    const existingIndex = trips.findIndex((t) => t.id === trip.id);

    if (existingIndex >= 0) {
      trips[existingIndex] = trip;
    } else {
      trips.push(trip);
    }

    await saveTripsOffline(trips);
  } catch (error) {
    console.error("Failed to save trip offline:", error);
    throw error;
  }
}

/**
 * Delete a trip from local storage
 */
export async function deleteTripOffline(tripId: string): Promise<void> {
  try {
    const trips = await getTripsOffline();
    const filteredTrips = trips.filter((t) => t.id !== tripId);
    await saveTripsOffline(filteredTrips);
  } catch (error) {
    console.error("Failed to delete trip offline:", error);
    throw error;
  }
}

/**
 * Add a pending sync operation
 */
export async function addPendingSyncOperation(
  operation: Omit<PendingSyncOperation, "id" | "timestamp">
): Promise<void> {
  try {
    const operations = await getPendingSyncOperations();
    const newOperation: PendingSyncOperation = {
      ...operation,
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    operations.push(newOperation);
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_SYNC,
      JSON.stringify(operations)
    );
  } catch (error) {
    console.error("Failed to add pending sync operation:", error);
    throw error;
  }
}

/**
 * Get all pending sync operations
 */
export async function getPendingSyncOperations(): Promise<
  PendingSyncOperation[]
> {
  try {
    const operationsJson = await AsyncStorage.getItem(
      STORAGE_KEYS.PENDING_SYNC
    );
    return operationsJson ? JSON.parse(operationsJson) : [];
  } catch (error) {
    console.error("Failed to get pending sync operations:", error);
    return [];
  }
}

/**
 * Remove a pending sync operation
 */
export async function removePendingSyncOperation(
  operationId: string
): Promise<void> {
  try {
    const operations = await getPendingSyncOperations();
    const filteredOperations = operations.filter((op) => op.id !== operationId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_SYNC,
      JSON.stringify(filteredOperations)
    );
  } catch (error) {
    console.error("Failed to remove pending sync operation:", error);
    throw error;
  }
}

/**
 * Clear all pending sync operations
 */
export async function clearPendingSyncOperations(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
  } catch (error) {
    console.error("Failed to clear pending sync operations:", error);
    throw error;
  }
}

/**
 * Update last sync timestamp
 */
export async function updateLastSyncTimestamp(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error("Failed to update last sync timestamp:", error);
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTimestamp(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error("Failed to get last sync timestamp:", error);
    return null;
  }
}

/**
 * Clear all offline data
 */
export async function clearOfflineData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.TRIPS,
      STORAGE_KEYS.PENDING_SYNC,
      STORAGE_KEYS.LAST_SYNC,
    ]);
  } catch (error) {
    console.error("Failed to clear offline data:", error);
    throw error;
  }
}
