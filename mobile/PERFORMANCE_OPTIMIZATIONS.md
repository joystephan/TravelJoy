# Performance Optimizations

This document outlines the performance optimizations implemented in the TravelJoy mobile application.

## Overview

The app has been optimized for better performance, reduced memory usage, and improved user experience on both iOS and Android devices.

## Implemented Optimizations

### 1. Lazy Loading and Code Splitting

**Location:** `mobile/src/navigation/AppNavigator.tsx`

- Implemented React lazy loading for all screen components
- Screens are only loaded when needed, reducing initial bundle size
- Added Suspense boundaries with loading fallbacks
- Enabled lazy loading for tab navigator screens

**Benefits:**

- Faster initial app load time
- Reduced memory footprint
- Better performance on low-end devices

**Usage:**

```typescript
const ScreenComponent = lazy(() => import("../screens/ScreenComponent"));

// Wrap with Suspense
<Suspense fallback={<LoadingFallback />}>
  <ScreenComponent />
</Suspense>;
```

### 2. Optimized Context Providers

**Location:**

- `mobile/src/contexts/AuthContext.tsx`
- `mobile/src/contexts/SubscriptionContext.tsx`

**Optimizations:**

- Memoized context values using `useMemo`
- Memoized callback functions using `useCallback`
- Prevents unnecessary re-renders of child components

**Benefits:**

- Reduced re-renders across the app
- Better performance when context values change
- Improved responsiveness

### 3. Image Optimization

**Location:**

- `mobile/src/components/OptimizedImage.tsx`
- `mobile/src/utils/performanceUtils.ts`

**Features:**

- Image caching using AsyncStorage
- Lazy loading with loading states
- Error handling with fallback images
- Memoized component to prevent unnecessary re-renders

**Usage:**

```typescript
import { OptimizedImage } from "../components";

<OptimizedImage
  source={{ uri: imageUrl }}
  style={styles.image}
  cacheEnabled={true}
  fallbackSource={require("../assets/placeholder.png")}
/>;
```

### 4. Performance Utilities

**Location:** `mobile/src/utils/performanceUtils.ts`

**Available Utilities:**

#### Debounce Hook

Delays function execution until after a specified time:

```typescript
const debouncedSearch = useDebounce(searchFunction, 300);
```

#### Throttle Hook

Limits function execution rate:

```typescript
const throttledScroll = useThrottle(scrollHandler, 100);
```

#### Image Cache Manager

Manages image caching:

```typescript
import { imageCacheManager } from "../utils/performanceUtils";

// Get cached image
const cachedUri = await imageCacheManager.getCachedImage(url);

// Cache image
await imageCacheManager.cacheImage(url, localUri);

// Clear cache
await imageCacheManager.clearCache();
```

#### Memoization

Cache expensive computations:

```typescript
const expensiveFunction = memoize((input) => {
  // Expensive computation
  return result;
});
```

#### Batch Updater

Batch multiple updates to reduce re-renders:

```typescript
const batcher = new BatchUpdater((updates) => {
  // Process all updates at once
}, 100);

batcher.add(update1);
batcher.add(update2);
// Updates are batched and processed together
```

#### Optimized FlatList Props

Pre-configured props for optimal list performance:

```typescript
import { optimizedFlatListProps } from "../utils/performanceUtils";

<FlatList {...optimizedFlatListProps} data={items} renderItem={renderItem} />;
```

### 5. Performance Monitoring

**Location:** `mobile/src/utils/performanceMonitor.ts`

**Features:**

- Track operation durations
- Monitor component render performance
- Get performance summaries
- Development-only (disabled in production)

**Usage:**

#### Measure Operations

```typescript
import { performanceMonitor } from "../utils/performanceMonitor";

// Start measurement
performanceMonitor.start("fetchData");

// ... perform operation ...

// End measurement
performanceMonitor.end("fetchData"); // Logs: ⏱️ fetchData: 150ms
```

#### Measure Async Operations

```typescript
const data = await performanceMonitor.measure("apiCall", () =>
  fetchDataFromAPI()
);
```

#### Monitor Component Renders

```typescript
import { useRenderPerformance } from "../utils/performanceMonitor";

function MyComponent() {
  useRenderPerformance("MyComponent");
  // Component will log re-renders in development
}
```

#### Get Performance Summary

```typescript
performanceMonitor.logSummary();
// Logs:
// 📊 Performance Summary:
// Total Metrics: 10
// Average Duration: 125.50ms
// Slowest: apiCall (500ms)
// Fastest: cacheRead (10ms)
```

## Backend Caching Optimizations

### Redis Caching

**Location:** `backend/src/config/redis.ts`

**Features:**

- Enhanced Redis configuration with connection pooling
- Automatic reconnection on errors
- Graceful shutdown handling
- Comprehensive cache utility functions

**Cache Utilities:**

```typescript
import { cacheUtils } from "../config/redis";

// Get from cache
const data = await cacheUtils.get<DataType>("key");

// Set in cache with TTL
await cacheUtils.set("key", data, 3600);

// Delete key
await cacheUtils.del("key");

// Delete pattern
await cacheUtils.delPattern("weather:*");

// Get cache statistics
const stats = await cacheUtils.getStats();
```

### Cache Invalidation Service

**Location:** `backend/src/services/cacheInvalidationService.ts`

**Features:**

- Invalidate weather cache by location
- Invalidate place/geocoding cache
- Invalidate country information cache
- Bulk invalidation strategies
- Cache statistics and monitoring
- Scheduled cleanup tasks

**Usage:**

```typescript
import cacheInvalidationService from "../services/cacheInvalidationService";

// Invalidate weather cache
await cacheInvalidationService.invalidateWeatherCache(lat, lon);

// Invalidate all external API cache
await cacheInvalidationService.invalidateAllExternalApiCache();

// Get cache statistics
const stats = await cacheInvalidationService.getCacheStats();

// Schedule periodic cleanup
const stopCleanup = cacheInvalidationService.schedulePeriodicCleanup(24);
```

### External API Caching

All external API services implement caching:

- **Weather Service:** 1-hour cache for current weather, forecasts
- **Nominatim Service:** 24-hour cache for place searches, geocoding
- **Countries Service:** 7-day cache for country information

## Best Practices

### 1. Component Optimization

- Use `React.memo` for components that receive the same props frequently
- Implement custom comparison functions for complex props
- Use `useMemo` for expensive computations
- Use `useCallback` for callback functions passed to child components

### 2. List Rendering

- Always provide a unique `key` prop
- Use `getItemLayout` for fixed-height items
- Implement `removeClippedSubviews` for long lists
- Use `initialNumToRender` and `maxToRenderPerBatch` appropriately

### 3. Image Handling

- Use `OptimizedImage` component for all remote images
- Provide appropriate image dimensions
- Use placeholder images for better UX
- Enable caching for frequently accessed images

### 4. State Management

- Keep state as local as possible
- Avoid unnecessary global state
- Use context sparingly and memoize values
- Split contexts by concern to reduce re-renders

### 5. Navigation

- Enable lazy loading for screens
- Use stack navigator efficiently
- Avoid deep navigation stacks
- Clear navigation state when appropriate

## Performance Metrics

### Target Metrics

- **Initial Load Time:** < 2 seconds
- **Screen Transition:** < 300ms
- **API Response Time:** < 1 second (with caching)
- **Memory Usage:** < 150MB on average
- **Frame Rate:** 60 FPS during animations

### Monitoring

Use the performance monitor in development to track:

- Screen load times
- API call durations
- Component render counts
- Memory usage patterns

## Future Optimizations

Potential areas for further optimization:

1. **Image Compression:** Implement automatic image compression
2. **Offline Mode:** Enhanced offline data persistence
3. **Background Sync:** Sync data in background when online
4. **Bundle Splitting:** Further code splitting for larger features
5. **Native Modules:** Use native modules for performance-critical operations
6. **Web Workers:** Offload heavy computations to web workers

## Troubleshooting

### High Memory Usage

- Check for memory leaks in useEffect cleanup
- Verify images are being properly cached
- Monitor component re-render counts
- Use performance profiler to identify issues

### Slow Screen Transitions

- Ensure lazy loading is working correctly
- Check for blocking operations in render
- Verify navigation configuration
- Profile component render times

### Cache Issues

- Clear AsyncStorage if cache becomes corrupted
- Monitor cache size and implement cleanup
- Verify cache keys are unique
- Check Redis connection status

## Resources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [React Optimization](https://react.dev/learn/render-and-commit)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
