import { useCallback, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Performance optimization utilities for React Native
 */

/**
 * Debounce hook for optimizing frequent function calls
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

/**
 * Throttle hook for limiting function execution rate
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  );
};

/**
 * Image cache manager
 */
class ImageCacheManager {
  private cachePrefix = "@image_cache:";
  private maxCacheSize = 50; // Maximum number of cached images
  private cacheKeys: string[] = [];

  /**
   * Get cached image URI
   */
  async getCachedImage(url: string): Promise<string | null> {
    try {
      const cacheKey = this.cachePrefix + this.hashUrl(url);
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached;
    } catch (error) {
      console.error("Error getting cached image:", error);
      return null;
    }
  }

  /**
   * Cache image URI
   */
  async cacheImage(url: string, localUri: string): Promise<void> {
    try {
      const cacheKey = this.cachePrefix + this.hashUrl(url);

      // Add to cache
      await AsyncStorage.setItem(cacheKey, localUri);

      // Track cache keys
      this.cacheKeys.push(cacheKey);

      // Enforce cache size limit
      if (this.cacheKeys.length > this.maxCacheSize) {
        const oldestKey = this.cacheKeys.shift();
        if (oldestKey) {
          await AsyncStorage.removeItem(oldestKey);
        }
      }
    } catch (error) {
      console.error("Error caching image:", error);
    }
  }

  /**
   * Clear image cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const imageCacheKeys = keys.filter((key) =>
        key.startsWith(this.cachePrefix)
      );
      await AsyncStorage.multiRemove(imageCacheKeys);
      this.cacheKeys = [];
    } catch (error) {
      console.error("Error clearing image cache:", error);
    }
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter((key) => key.startsWith(this.cachePrefix)).length;
    } catch (error) {
      console.error("Error getting cache size:", error);
      return 0;
    }
  }

  /**
   * Simple hash function for URLs
   */
  private hashUrl(url: string): string {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export const imageCacheManager = new ImageCacheManager();

/**
 * Memoization utility for expensive computations
 */
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);

    // Limit cache size
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return result;
  }) as T;
};

/**
 * Batch updates to reduce re-renders
 */
export class BatchUpdater<T> {
  private updates: T[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private callback: (updates: T[]) => void;
  private delay: number;

  constructor(callback: (updates: T[]) => void, delay: number = 100) {
    this.callback = callback;
    this.delay = delay;
  }

  add(update: T): void {
    this.updates.push(update);

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  flush(): void {
    if (this.updates.length > 0) {
      this.callback([...this.updates]);
      this.updates = [];
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

/**
 * Optimize list rendering by calculating optimal item height
 */
export const calculateOptimalItemHeight = (
  screenHeight: number,
  itemCount: number
): number => {
  // Show 5-10 items on screen at once for optimal performance
  const minItemsVisible = 5;
  const maxItemsVisible = 10;

  const optimalHeight = screenHeight / maxItemsVisible;
  const minHeight = screenHeight / minItemsVisible;

  return Math.max(optimalHeight, 80); // Minimum 80px height
};

/**
 * Memory usage monitor (development only)
 */
export const logMemoryUsage = (): void => {
  if (__DEV__) {
    // Memory monitoring is environment-specific
    // This is a placeholder for native memory monitoring
    console.log("Memory monitoring available in native profiler");
  }
};

/**
 * Optimize FlatList configuration
 */
export const optimizedFlatListProps = {
  removeClippedSubviews: true, // Unmount components outside viewport
  maxToRenderPerBatch: 10, // Reduce number of items rendered per batch
  updateCellsBatchingPeriod: 50, // Increase time between renders
  initialNumToRender: 10, // Reduce initial render amount
  windowSize: 5, // Reduce viewport size
  getItemLayout: (data: any, index: number) => ({
    length: 100, // Estimated item height
    offset: 100 * index,
    index,
  }),
};

/**
 * Prevent unnecessary re-renders by comparing props
 */
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
};
