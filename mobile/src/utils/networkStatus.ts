import NetInfo, { NetInfoState } from "@react-native-community/netinfo";

let isOnline = true;
let listeners: Array<(online: boolean) => void> = [];

/**
 * Initialize network status monitoring
 */
export function initializeNetworkMonitoring(): () => void {
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const wasOnline = isOnline;
    isOnline =
      state.isConnected === true && state.isInternetReachable !== false;

    // Notify listeners if status changed
    if (wasOnline !== isOnline) {
      console.log(`Network status changed: ${isOnline ? "online" : "offline"}`);
      listeners.forEach((listener) => listener(isOnline));
    }
  });

  return unsubscribe;
}

/**
 * Check if device is currently online
 */
export function getIsOnline(): boolean {
  return isOnline;
}

/**
 * Get current network state
 */
export async function getNetworkState(): Promise<NetInfoState> {
  return await NetInfo.fetch();
}

/**
 * Add a listener for network status changes
 */
export function addNetworkListener(
  listener: (online: boolean) => void
): () => void {
  listeners.push(listener);

  // Return unsubscribe function
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/**
 * Wait for network to be online
 */
export async function waitForOnline(timeout: number = 30000): Promise<boolean> {
  if (isOnline) {
    return true;
  }

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      resolve(false);
    }, timeout);

    const unsubscribe = addNetworkListener((online) => {
      if (online) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(true);
      }
    });
  });
}
