import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getIsOnline, addNetworkListener } from "../utils/networkStatus";
import { syncService, SyncStatus } from "../services/syncService";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(getIsOnline());
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    // Listen for network changes
    const unsubscribeNetwork = addNetworkListener((online) => {
      setIsOnline(online);
    });

    // Listen for sync status changes
    const unsubscribeSync = syncService.addSyncListener((status) => {
      setSyncStatus(status);

      // Clear sync status after completion
      if (status.status === "completed" || status.status === "failed") {
        setTimeout(() => setSyncStatus(null), 3000);
      }
    });

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
    };
  }, []);

  const handleSync = () => {
    if (isOnline && !syncService.isSyncInProgress()) {
      syncService.syncData();
    }
  };

  // Don't show anything if online and not syncing
  if (isOnline && !syncStatus) {
    return null;
  }

  return (
    <View style={styles.container}>
      {!isOnline && (
        <View style={styles.offlineBar}>
          <Text style={styles.offlineText}>📵 Offline Mode</Text>
          <Text style={styles.offlineSubtext}>
            Changes will sync when you're back online
          </Text>
        </View>
      )}

      {syncStatus && (
        <View style={styles.syncBar}>
          {syncStatus.status === "syncing" && (
            <>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.syncText}>
                Syncing... {syncStatus.progress}%
              </Text>
            </>
          )}
          {syncStatus.status === "completed" && (
            <>
              <Text style={styles.syncEmoji}>✅</Text>
              <Text style={styles.syncText}>Synced successfully</Text>
            </>
          )}
          {syncStatus.status === "failed" && (
            <>
              <Text style={styles.syncEmoji}>⚠️</Text>
              <Text style={styles.syncText}>Sync failed</Text>
              <TouchableOpacity onPress={handleSync} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {isOnline && !syncStatus && (
        <TouchableOpacity onPress={handleSync} style={styles.syncButton}>
          <Text style={styles.syncButtonText}>🔄 Sync Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  offlineBar: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFE69C",
  },
  offlineText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#856404",
    textAlign: "center",
  },
  offlineSubtext: {
    fontSize: 12,
    color: "#856404",
    textAlign: "center",
    marginTop: 4,
  },
  syncBar: {
    backgroundColor: "#E3F2FD",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#BBDEFB",
  },
  syncText: {
    fontSize: 14,
    color: "#1976D2",
    marginLeft: 8,
  },
  syncEmoji: {
    fontSize: 16,
  },
  retryButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#007AFF",
    borderRadius: 4,
  },
  retryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  syncButton: {
    backgroundColor: "#E3F2FD",
    padding: 8,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#BBDEFB",
  },
  syncButtonText: {
    fontSize: 12,
    color: "#1976D2",
    fontWeight: "600",
  },
});
