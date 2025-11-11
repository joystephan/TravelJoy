import { tripService } from "./tripService";
import {
  getPendingSyncOperations,
  removePendingSyncOperation,
  updateLastSyncTimestamp,
  getTripsOffline,
  saveTripsOffline,
} from "../utils/offlineStorage";
import { getIsOnline, addNetworkListener } from "../utils/networkStatus";

class SyncService {
  private isSyncing = false;
  private syncListeners: Array<(status: SyncStatus) => void> = [];

  constructor() {
    // Listen for network changes and sync when online
    addNetworkListener((online) => {
      if (online && !this.isSyncing) {
        this.syncData();
      }
    });
  }

  /**
   * Sync pending operations with server
   */
  async syncData(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, message: "Sync already in progress" };
    }

    if (!getIsOnline()) {
      return { success: false, message: "Device is offline" };
    }

    this.isSyncing = true;
    this.notifyListeners({ status: "syncing", progress: 0 });

    try {
      const operations = await getPendingSyncOperations();

      if (operations.length === 0) {
        // No pending operations, just fetch latest data
        await this.fetchLatestTrips();
        this.notifyListeners({ status: "completed", progress: 100 });
        this.isSyncing = false;
        return { success: true, message: "Already up to date" };
      }

      let successCount = 0;
      let failedOperations: string[] = [];

      // Process each pending operation
      for (let i = 0; i < operations.length; i++) {
        const operation = operations[i];
        const progress = Math.round(((i + 1) / operations.length) * 100);

        this.notifyListeners({ status: "syncing", progress });

        try {
          await this.processSyncOperation(operation);
          await removePendingSyncOperation(operation.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to sync operation ${operation.id}:`, error);
          failedOperations.push(operation.id);
        }
      }

      // Fetch latest data from server
      await this.fetchLatestTrips();
      await updateLastSyncTimestamp();

      this.notifyListeners({ status: "completed", progress: 100 });
      this.isSyncing = false;

      if (failedOperations.length === 0) {
        return {
          success: true,
          message: `Successfully synced ${successCount} operations`,
        };
      } else {
        return {
          success: false,
          message: `Synced ${successCount} operations, ${failedOperations.length} failed`,
          failedOperations,
        };
      }
    } catch (error) {
      console.error("Sync failed:", error);
      this.notifyListeners({ status: "failed", progress: 0 });
      this.isSyncing = false;
      return {
        success: false,
        message: error instanceof Error ? error.message : "Sync failed",
      };
    }
  }

  /**
   * Process a single sync operation
   */
  private async processSyncOperation(operation: any): Promise<void> {
    switch (operation.type) {
      case "CREATE_TRIP":
        await tripService.createTrip(operation.data);
        break;
      case "UPDATE_TRIP":
        // Implement trip update logic
        break;
      case "DELETE_TRIP":
        await tripService.deleteTrip(operation.data.tripId);
        break;
      case "UPDATE_ACTIVITY":
        await tripService.updateActivity(
          operation.data.activityId,
          operation.data.updates
        );
        break;
      default:
        console.warn(`Unknown sync operation type: ${operation.type}`);
    }
  }

  /**
   * Fetch latest trips from server and update local storage
   */
  private async fetchLatestTrips(): Promise<void> {
    try {
      const trips = await tripService.getUserTrips();
      await saveTripsOffline(trips);
    } catch (error) {
      console.error("Failed to fetch latest trips:", error);
      throw error;
    }
  }

  /**
   * Add a sync status listener
   */
  addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.syncListeners.push(listener);
    return () => {
      this.syncListeners = this.syncListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of sync status change
   */
  private notifyListeners(status: SyncStatus): void {
    this.syncListeners.forEach((listener) => listener(status));
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

export interface SyncStatus {
  status: "syncing" | "completed" | "failed";
  progress: number;
}

export interface SyncResult {
  success: boolean;
  message: string;
  failedOperations?: string[];
}

export const syncService = new SyncService();
