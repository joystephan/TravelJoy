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
    } catch (error) {
      console.error("Weather service error:", error);
      // Return default weather data if API fails
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
    } catch (error) {
      console.error("Weather forecast error:", error);
      return [];
    }
  }
}

export const weatherService = new WeatherService();
