import api from "./api";

interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

class WeatherService {
  async getWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const response = await api.get("/weather", {
        params: { latitude, longitude },
      });
      return response.data;
    } catch (error: any) {
      // Weather endpoint may not be available - silently return default data
      // This is expected behavior as weather is optional
      // Only log if it's not a 404 (expected) or network error
      if (error?.response?.status !== 404) {
        console.warn("Weather service unavailable:", error?.message);
      }
      return {
        temperature: 20,
        condition: "Unknown",
        icon: "01d",
      };
    }
  }

  async getForecast(
    latitude: number,
    longitude: number,
    days: number = 5
  ): Promise<WeatherData[]> {
    try {
      const response = await api.get("/weather/forecast", {
        params: { latitude, longitude, days },
      });
      return response.data;
    } catch (error: any) {
      // Weather endpoint may not be available - silently return empty array
      // This is expected behavior as weather is optional
      // Only log if it's not a 404 (expected) or network error
      if (error?.response?.status !== 404) {
        console.warn("Weather forecast service unavailable:", error?.message);
      }
      return [];
    }
  }
}

export const weatherService = new WeatherService();
