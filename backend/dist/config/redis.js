"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheUtils = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// Redis client configuration with enhanced error handling and connection pooling
const redisClient = new ioredis_1.default({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0"),
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError: (err) => {
        const targetError = "READONLY";
        if (err.message.includes(targetError)) {
            // Reconnect when Redis is in readonly mode
            return true;
        }
        return false;
    },
});
redisClient.on("connect", () => {
    console.log("✓ Redis client connected");
});
redisClient.on("ready", () => {
    console.log("✓ Redis client ready");
});
redisClient.on("error", (err) => {
    console.error("✗ Redis client error:", err.message);
});
redisClient.on("close", () => {
    console.log("⚠ Redis connection closed");
});
redisClient.on("reconnecting", () => {
    console.log("⟳ Redis client reconnecting...");
});
// Graceful shutdown
process.on("SIGINT", async () => {
    await redisClient.quit();
    console.log("Redis connection closed through app termination");
    process.exit(0);
});
/**
 * Cache utility functions
 */
exports.cacheUtils = {
    /**
     * Get value from cache with error handling
     */
    async get(key) {
        try {
            const cached = await redisClient.get(key);
            return cached ? JSON.parse(cached) : null;
        }
        catch (error) {
            console.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    },
    /**
     * Set value in cache with TTL
     */
    async set(key, value, ttl) {
        try {
            await redisClient.set(key, JSON.stringify(value), "EX", ttl);
            return true;
        }
        catch (error) {
            console.error(`Cache set error for key ${key}:`, error);
            return false;
        }
    },
    /**
     * Delete specific key from cache
     */
    async del(key) {
        try {
            await redisClient.del(key);
            return true;
        }
        catch (error) {
            console.error(`Cache delete error for key ${key}:`, error);
            return false;
        }
    },
    /**
     * Delete keys matching a pattern
     */
    async delPattern(pattern) {
        try {
            const keys = await redisClient.keys(pattern);
            if (keys.length === 0)
                return 0;
            await redisClient.del(...keys);
            return keys.length;
        }
        catch (error) {
            console.error(`Cache delete pattern error for ${pattern}:`, error);
            return 0;
        }
    },
    /**
     * Check if key exists
     */
    async exists(key) {
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        }
        catch (error) {
            console.error(`Cache exists error for key ${key}:`, error);
            return false;
        }
    },
    /**
     * Get TTL for a key
     */
    async ttl(key) {
        try {
            return await redisClient.ttl(key);
        }
        catch (error) {
            console.error(`Cache TTL error for key ${key}:`, error);
            return -1;
        }
    },
    /**
     * Extend TTL for a key
     */
    async expire(key, ttl) {
        try {
            await redisClient.expire(key, ttl);
            return true;
        }
        catch (error) {
            console.error(`Cache expire error for key ${key}:`, error);
            return false;
        }
    },
    /**
     * Clear all cache (use with caution)
     */
    async flushAll() {
        try {
            await redisClient.flushall();
            return true;
        }
        catch (error) {
            console.error("Cache flush all error:", error);
            return false;
        }
    },
    /**
     * Get cache statistics
     */
    async getStats() {
        try {
            const info = await redisClient.info("stats");
            const dbSize = await redisClient.dbsize();
            const parseInfo = (info, key) => {
                const match = info.match(new RegExp(`${key}:(.+)`));
                return match ? match[1].trim() : "0";
            };
            return {
                keys: dbSize,
                memory: parseInfo(await redisClient.info("memory"), "used_memory_human"),
                hits: parseInfo(info, "keyspace_hits"),
                misses: parseInfo(info, "keyspace_misses"),
            };
        }
        catch (error) {
            console.error("Cache stats error:", error);
            return { keys: 0, memory: "0", hits: "0", misses: "0" };
        }
    },
};
exports.default = redisClient;
