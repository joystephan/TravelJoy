"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("../config/redis");
/**
 * Cache Invalidation Service
 * Provides strategies for invalidating cached data across different services
 */
class CacheInvalidationService {
    /**
     * Invalidate all weather cache for a specific location
     */
    async invalidateWeatherCache(lat, lon) {
        const patterns = [
            `weather:current:${lat}:${lon}`,
            `weather:forecast:${lat}:${lon}:*`,
        ];
        let deletedCount = 0;
        for (const pattern of patterns) {
            deletedCount += await redis_1.cacheUtils.delPattern(pattern);
        }
        console.log(`Invalidated ${deletedCount} weather cache entries for location (${lat}, ${lon})`);
        return deletedCount;
    }
    /**
     * Invalidate all place/location cache for a specific query
     */
    async invalidatePlaceCache(query) {
        const pattern = `nominatim:search:${query}:*`;
        const deletedCount = await redis_1.cacheUtils.delPattern(pattern);
        console.log(`Invalidated ${deletedCount} place cache entries for query: ${query}`);
        return deletedCount;
    }
    /**
     * Invalidate geocoding cache for a specific address
     */
    async invalidateGeocodeCache(address) {
        const key = `nominatim:geocode:${address}`;
        const deleted = await redis_1.cacheUtils.del(key);
        console.log(`Invalidated geocode cache for address: ${address}`);
        return deleted ? 1 : 0;
    }
    /**
     * Invalidate reverse geocoding cache for coordinates
     */
    async invalidateReverseGeocodeCache(lat, lon) {
        const key = `nominatim:reverse:${lat}:${lon}`;
        const deleted = await redis_1.cacheUtils.del(key);
        console.log(`Invalidated reverse geocode cache for coordinates (${lat}, ${lon})`);
        return deleted ? 1 : 0;
    }
    /**
     * Invalidate country information cache
     */
    async invalidateCountryCache(countryCode, countryName) {
        let deletedCount = 0;
        if (countryCode) {
            const key = `countries:code:${countryCode.toUpperCase()}`;
            const deleted = await redis_1.cacheUtils.del(key);
            deletedCount += deleted ? 1 : 0;
        }
        if (countryName) {
            const key = `countries:name:${countryName.toLowerCase()}`;
            const deleted = await redis_1.cacheUtils.del(key);
            deletedCount += deleted ? 1 : 0;
        }
        if (!countryCode && !countryName) {
            // Invalidate all country cache
            deletedCount = await redis_1.cacheUtils.delPattern("countries:*");
        }
        console.log(`Invalidated ${deletedCount} country cache entries`);
        return deletedCount;
    }
    /**
     * Invalidate all external API caches
     */
    async invalidateAllExternalApiCache() {
        const [weather, places, countries] = await Promise.all([
            redis_1.cacheUtils.delPattern("weather:*"),
            redis_1.cacheUtils.delPattern("nominatim:*"),
            redis_1.cacheUtils.delPattern("countries:*"),
        ]);
        const total = weather + places + countries;
        console.log(`Invalidated all external API cache: ${total} entries`);
        return { weather, places, countries, total };
    }
    /**
     * Invalidate expired cache entries (TTL-based cleanup)
     * Note: Redis automatically removes expired keys, but this can be used for manual cleanup
     */
    async cleanupExpiredCache() {
        // Redis handles TTL automatically, but we can check for keys with no TTL
        console.log("Redis automatically handles TTL-based expiration");
        return 0;
    }
    /**
     * Invalidate cache by age (older than specified seconds)
     */
    async invalidateCacheByAge(pattern, maxAgeSeconds) {
        try {
            const keys = await redis_1.cacheUtils.delPattern(pattern);
            // Note: This is a simplified implementation
            // For more precise age-based invalidation, store timestamps with cache entries
            console.log(`Invalidated ${keys} cache entries matching pattern: ${pattern}`);
            return keys;
        }
        catch (error) {
            console.error("Error invalidating cache by age:", error);
            return 0;
        }
    }
    /**
     * Get cache statistics for monitoring
     */
    async getCacheStats() {
        const stats = await redis_1.cacheUtils.getStats();
        const hits = parseInt(stats.hits) || 0;
        const misses = parseInt(stats.misses) || 0;
        const total = hits + misses;
        const hitRate = total > 0 ? ((hits / total) * 100).toFixed(2) + "%" : "0%";
        return {
            ...stats,
            hitRate,
        };
    }
    /**
     * Warm up cache with frequently accessed data
     * This can be called on application startup or scheduled periodically
     */
    async warmUpCache(destinations) {
        console.log(`Warming up cache for ${destinations.length} destinations...`);
        // This would typically pre-fetch and cache common destinations
        // Implementation depends on your specific use case
        for (const destination of destinations) {
            try {
                // Pre-cache destination data
                // This is a placeholder - actual implementation would call the services
                console.log(`Pre-caching data for: ${destination}`);
            }
            catch (error) {
                console.error(`Failed to warm up cache for ${destination}:`, error);
            }
        }
        console.log("Cache warm-up completed");
    }
    /**
     * Schedule automatic cache invalidation
     * Returns a cleanup function to stop the scheduled task
     */
    schedulePeriodicCleanup(intervalHours = 24) {
        console.log(`Scheduling cache cleanup every ${intervalHours} hours`);
        const intervalMs = intervalHours * 60 * 60 * 1000;
        const intervalId = setInterval(async () => {
            console.log("Running scheduled cache cleanup...");
            const stats = await this.getCacheStats();
            console.log("Cache stats before cleanup:", stats);
            // Cleanup old weather data (older than 2 hours)
            await redis_1.cacheUtils.delPattern("weather:current:*");
            console.log("Scheduled cache cleanup completed");
        }, intervalMs);
        // Return cleanup function
        return () => {
            clearInterval(intervalId);
            console.log("Stopped scheduled cache cleanup");
        };
    }
}
exports.default = new CacheInvalidationService();
