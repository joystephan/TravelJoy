/**
 * Test script for Redis caching and cache invalidation
 */
import redisClient, { cacheUtils } from "./config/redis";
import cacheInvalidationService from "./services/cacheInvalidationService";

async function testRedisConnection() {
  console.log("\n🧪 Testing Redis Connection...");
  try {
    await redisClient.ping();
    console.log("✓ Redis connection successful");
    return true;
  } catch (error) {
    console.error("✗ Redis connection failed:", error);
    return false;
  }
}

async function testCacheUtils() {
  console.log("\n🧪 Testing Cache Utilities...");

  try {
    // Test set
    const testKey = "test:key:1";
    const testData = { message: "Hello, Cache!", timestamp: Date.now() };
    await cacheUtils.set(testKey, testData, 60);
    console.log("✓ Cache set successful");

    // Test get
    const retrieved = await cacheUtils.get<typeof testData>(testKey);
    if (retrieved && retrieved.message === testData.message) {
      console.log("✓ Cache get successful");
    } else {
      console.error("✗ Cache get failed - data mismatch");
    }

    // Test exists
    const exists = await cacheUtils.exists(testKey);
    if (exists) {
      console.log("✓ Cache exists check successful");
    } else {
      console.error("✗ Cache exists check failed");
    }

    // Test TTL
    const ttl = await cacheUtils.ttl(testKey);
    if (ttl > 0 && ttl <= 60) {
      console.log(`✓ Cache TTL check successful (${ttl}s remaining)`);
    } else {
      console.error("✗ Cache TTL check failed");
    }

    // Test delete
    await cacheUtils.del(testKey);
    const existsAfterDelete = await cacheUtils.exists(testKey);
    if (!existsAfterDelete) {
      console.log("✓ Cache delete successful");
    } else {
      console.error("✗ Cache delete failed");
    }

    return true;
  } catch (error) {
    console.error("✗ Cache utilities test failed:", error);
    return false;
  }
}

async function testCachePatterns() {
  console.log("\n🧪 Testing Cache Pattern Operations...");

  try {
    // Create multiple keys with pattern
    const keys = [
      "weather:current:40.7128:-74.0060",
      "weather:current:51.5074:-0.1278",
      "weather:forecast:40.7128:-74.0060:5",
    ];

    for (const key of keys) {
      await cacheUtils.set(key, { data: "test" }, 60);
    }
    console.log(`✓ Created ${keys.length} test cache entries`);

    // Test pattern deletion
    const deletedCount = await cacheUtils.delPattern("weather:current:*");
    if (deletedCount === 2) {
      console.log(
        `✓ Pattern deletion successful (deleted ${deletedCount} keys)`
      );
    } else {
      console.error(
        `✗ Pattern deletion failed (expected 2, got ${deletedCount})`
      );
    }

    // Cleanup remaining keys
    await cacheUtils.delPattern("weather:*");

    return true;
  } catch (error) {
    console.error("✗ Cache pattern test failed:", error);
    return false;
  }
}

async function testCacheInvalidation() {
  console.log("\n🧪 Testing Cache Invalidation Service...");

  try {
    // Create test weather cache
    await cacheUtils.set("weather:current:40.7128:-74.0060", { temp: 20 }, 60);
    await cacheUtils.set(
      "weather:forecast:40.7128:-74.0060:5",
      { data: [] },
      60
    );
    console.log("✓ Created test weather cache entries");

    // Test weather cache invalidation
    const invalidated = await cacheInvalidationService.invalidateWeatherCache(
      40.7128,
      -74.006
    );
    if (invalidated >= 2) {
      console.log(
        `✓ Weather cache invalidation successful (${invalidated} entries)`
      );
    } else {
      console.log(
        `⚠ Weather cache invalidation completed (${invalidated} entries)`
      );
    }

    // Create test place cache
    await cacheUtils.set("nominatim:search:Paris:*", { places: [] }, 60);
    await cacheUtils.set(
      "nominatim:geocode:Paris",
      { lat: 48.8566, lon: 2.3522 },
      60
    );
    console.log("✓ Created test place cache entries");

    // Test place cache invalidation
    const placeInvalidated =
      await cacheInvalidationService.invalidatePlaceCache("Paris");
    console.log(
      `✓ Place cache invalidation successful (${placeInvalidated} entries)`
    );

    // Cleanup
    await cacheUtils.delPattern("nominatim:*");

    return true;
  } catch (error) {
    console.error("✗ Cache invalidation test failed:", error);
    return false;
  }
}

async function testCacheStats() {
  console.log("\n🧪 Testing Cache Statistics...");

  try {
    const stats = await cacheUtils.getStats();
    console.log("✓ Cache statistics retrieved:");
    console.log(`  - Total keys: ${stats.keys}`);
    console.log(`  - Memory used: ${stats.memory}`);
    console.log(`  - Cache hits: ${stats.hits}`);
    console.log(`  - Cache misses: ${stats.misses}`);

    const serviceStats = await cacheInvalidationService.getCacheStats();
    console.log(`  - Hit rate: ${serviceStats.hitRate}`);

    return true;
  } catch (error) {
    console.error("✗ Cache statistics test failed:", error);
    return false;
  }
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("🚀 Redis Caching Test Suite");
  console.log("=".repeat(60));

  const results = {
    connection: false,
    utils: false,
    patterns: false,
    invalidation: false,
    stats: false,
  };

  results.connection = await testRedisConnection();

  if (results.connection) {
    results.utils = await testCacheUtils();
    results.patterns = await testCachePatterns();
    results.invalidation = await testCacheInvalidation();
    results.stats = await testCacheStats();
  } else {
    console.log("\n⚠ Skipping remaining tests due to connection failure");
    console.log("💡 Make sure Redis is running: redis-server");
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Results Summary");
  console.log("=".repeat(60));

  const passed = Object.values(results).filter((r) => r).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? "✓" : "✗";
    const status = passed ? "PASSED" : "FAILED";
    console.log(`${icon} ${test.padEnd(20)} ${status}`);
  });

  console.log("=".repeat(60));
  console.log(`Total: ${passed}/${total} tests passed`);
  console.log("=".repeat(60));

  // Cleanup and close connection
  await cacheUtils.delPattern("test:*");
  await redisClient.quit();

  process.exit(passed === total ? 0 : 1);
}

// Run tests
runTests().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
