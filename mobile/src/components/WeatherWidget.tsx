import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { weatherService } from "../services/weatherService";

interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
  date: Date;
}

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

export default function WeatherWidget({
  latitude,
  longitude,
  date,
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only load weather if coordinates are valid (not 0,0)
    if (latitude !== 0 || longitude !== 0) {
      loadWeather();
    } else {
      // Invalid coordinates - skip weather call
      setLoading(false);
      setWeather(null);
    }
  }, [latitude, longitude, date]);

  const loadWeather = async () => {
    // Double-check coordinates are valid before making API call
    if (latitude === 0 && longitude === 0) {
      setLoading(false);
      setWeather(null);
      return;
    }

    try {
      setLoading(true);
      const data = await weatherService.getWeather(latitude, longitude);
      setWeather(data);
    } catch (error) {
      // Silently handle weather errors - it's optional
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.temperature}>{Math.round(weather.temperature)}°</Text>
      <Text style={styles.condition}>{weather.condition}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 8,
    padding: 12,
    minWidth: 80,
    alignItems: "center",
  },
  temperature: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  condition: {
    fontSize: 12,
    color: "#fff",
    marginTop: 4,
  },
});
