import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Clear all AsyncStorage data
 * Useful for debugging and fresh starts
 */
export async function clearAllStorage() {
  try {
    await AsyncStorage.clear();
    console.log("✅ AsyncStorage cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing AsyncStorage:", error);
  }
}

/**
 * Get all AsyncStorage keys
 */
export async function getAllKeys() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("📦 AsyncStorage keys:", keys);
    return keys;
  } catch (error) {
    console.error("❌ Error getting keys:", error);
    return [];
  }
}

/**
 * Print all AsyncStorage data (for debugging)
 */
export async function debugStorage() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    console.log("📦 AsyncStorage contents:");
    items.forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  } catch (error) {
    console.error("❌ Error debugging storage:", error);
  }
}

export default {
  clearAllStorage,
  getAllKeys,
  debugStorage,
};



