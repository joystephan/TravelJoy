import React, { useState, useEffect, memo } from "react";
import {
  Image,
  ImageProps,
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import { imageCacheManager } from "../utils/performanceUtils";

interface OptimizedImageProps extends Omit<ImageProps, "source"> {
  source: { uri: string } | number;
  placeholder?: React.ReactNode;
  fallbackSource?: number;
  cacheEnabled?: boolean;
}

/**
 * Optimized Image component with caching and lazy loading
 */
const OptimizedImage: React.FC<OptimizedImageProps> = memo(
  ({
    source,
    placeholder,
    fallbackSource,
    cacheEnabled = true,
    style,
    ...props
  }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [cachedUri, setCachedUri] = useState<string | null>(null);

    useEffect(() => {
      if (typeof source === "number" || !cacheEnabled) {
        setLoading(false);
        return;
      }

      const loadImage = async () => {
        try {
          // Check cache first
          const cached = await imageCacheManager.getCachedImage(source.uri);
          if (cached) {
            setCachedUri(cached);
            setLoading(false);
            return;
          }

          // If not cached, use original URI
          setCachedUri(source.uri);
          setLoading(false);
        } catch (err) {
          console.error("Error loading image:", err);
          setError(true);
          setLoading(false);
        }
      };

      loadImage();
    }, [source, cacheEnabled]);

    const handleLoadEnd = () => {
      setLoading(false);
    };

    const handleError = () => {
      setError(true);
      setLoading(false);
    };

    if (loading && placeholder) {
      return <View style={[styles.container, style]}>{placeholder}</View>;
    }

    if (loading) {
      return (
        <View style={[styles.container, styles.loadingContainer, style]}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      );
    }

    if (error && fallbackSource) {
      return (
        <Image
          source={fallbackSource}
          style={style}
          {...props}
          onError={handleError}
        />
      );
    }

    if (error) {
      return (
        <View style={[styles.container, styles.errorContainer, style]}>
          <View style={styles.errorIcon} />
        </View>
      );
    }

    const imageSource =
      typeof source === "number"
        ? source
        : cachedUri
        ? { uri: cachedUri }
        : source;

    return (
      <Image
        source={imageSource}
        style={style}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        {...props}
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo
    if (
      typeof prevProps.source === "number" &&
      typeof nextProps.source === "number"
    ) {
      return prevProps.source === nextProps.source;
    }

    if (
      typeof prevProps.source === "object" &&
      typeof nextProps.source === "object"
    ) {
      return prevProps.source.uri === nextProps.source.uri;
    }

    return false;
  }
);

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingContainer: {
    backgroundColor: "#f0f0f0",
  },
  errorContainer: {
    backgroundColor: "#e0e0e0",
  },
  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
});

export default OptimizedImage;
