import redisClient from "../config/redis";

/**
 * Cache helper utility to avoid duplication across services
 * Provides consistent caching interface with error handling
 */
class CacheHelper {
  /**
   * Get data from cache
   * @param key Cache key
   * @returns Parsed data or null if not found/error
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  /**
   * Save data to cache with expiry
   * @param key Cache key
   * @param data Data to cache
   * @param expirySeconds Expiry time in seconds
   */
  async set(key: string, data: any, expirySeconds: number): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(data), "EX", expirySeconds);
    } catch (error) {
      console.error("Cache set error:", error);
    }
  }

  /**
   * Delete data from cache
   * @param key Cache key
   */
  async delete(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error("Cache delete error:", error);
    }
  }

  /**
   * Clear all cache keys matching a pattern
   * @param pattern Pattern to match (e.g., "weather:*")
   */
  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (error) {
      console.error("Cache clear pattern error:", error);
    }
  }
}

export const cacheHelper = new CacheHelper();

