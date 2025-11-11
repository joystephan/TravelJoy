/**
 * Performance monitoring utilities for React Native
 * Helps track and optimize app performance
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private enabled: boolean = __DEV__; // Only enable in development

  /**
   * Start measuring a performance metric
   */
  start(metricName: string): void {
    if (!this.enabled) return;

    this.metrics.set(metricName, {
      name: metricName,
      startTime: Date.now(),
    });
  }

  /**
   * End measuring a performance metric
   */
  end(metricName: string): number | null {
    if (!this.enabled) return null;

    const metric = this.metrics.get(metricName);
    if (!metric) {
      console.warn(`Performance metric "${metricName}" was not started`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    if (__DEV__) {
      console.log(`⏱️ ${metricName}: ${duration}ms`);
    }

    return duration;
  }

  /**
   * Measure async operation
   */
  async measure<T>(
    metricName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    if (!this.enabled) {
      return operation();
    }

    this.start(metricName);
    try {
      const result = await operation();
      this.end(metricName);
      return result;
    } catch (error) {
      this.end(metricName);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get a specific metric
   */
  getMetric(metricName: string): PerformanceMetric | undefined {
    return this.metrics.get(metricName);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Clear a specific metric
   */
  clearMetric(metricName: string): void {
    this.metrics.delete(metricName);
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number;
    averageDuration: number;
    slowestMetric: PerformanceMetric | null;
    fastestMetric: PerformanceMetric | null;
  } {
    const metrics = this.getMetrics().filter((m) => m.duration !== undefined);

    if (metrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        slowestMetric: null,
        fastestMetric: null,
      };
    }

    const durations = metrics.map((m) => m.duration!);
    const averageDuration =
      durations.reduce((sum, d) => sum + d, 0) / durations.length;

    const slowestMetric = metrics.reduce((slowest, current) =>
      current.duration! > slowest.duration! ? current : slowest
    );

    const fastestMetric = metrics.reduce((fastest, current) =>
      current.duration! < fastest.duration! ? current : fastest
    );

    return {
      totalMetrics: metrics.length,
      averageDuration,
      slowestMetric,
      fastestMetric,
    };
  }

  /**
   * Log performance summary
   */
  logSummary(): void {
    if (!this.enabled) return;

    const summary = this.getSummary();

    console.log("\n📊 Performance Summary:");
    console.log(`Total Metrics: ${summary.totalMetrics}`);
    console.log(`Average Duration: ${summary.averageDuration.toFixed(2)}ms`);

    if (summary.slowestMetric) {
      console.log(
        `Slowest: ${summary.slowestMetric.name} (${summary.slowestMetric.duration}ms)`
      );
    }

    if (summary.fastestMetric) {
      console.log(
        `Fastest: ${summary.fastestMetric.name} (${summary.fastestMetric.duration}ms)`
      );
    }

    console.log("\n");
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render performance
 */
export const useRenderPerformance = (componentName: string): void => {
  if (!__DEV__) return;

  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(Date.now());

  React.useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;

    if (renderCount.current > 1) {
      console.log(
        `🔄 ${componentName} re-rendered (${renderCount.current} times, ${timeSinceLastRender}ms since last render)`
      );
    }

    lastRenderTime.current = now;
  });
};

// Import React for the hook
import React from "react";

export default performanceMonitor;
