import { getIsOnline } from "./networkStatus";
import { addPendingSyncOperation } from "./offlineStorage";

/**
 * Offline helper utility
 * Provides consistent offline handling across services
 */

/**
 * Check if online and throw error if operation requires network
 * @param operationName Name of the operation
 * @throws Error if offline
 */
export function requireOnline(operationName: string): void {
  if (!getIsOnline()) {
    throw new Error(`Cannot ${operationName} while offline`);
  }
}

/**
 * Queue operation for sync when offline
 * @param type Operation type
 * @param data Operation data
 */
export async function queueForSync(
  type: string,
  data: any
): Promise<void> {
  await addPendingSyncOperation({ type, data });
}

/**
 * Check if online, return boolean
 */
export function isOnline(): boolean {
  return getIsOnline();
}

