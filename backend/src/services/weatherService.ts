import axios from "axios";
import { cacheHelper } from "../utils/cacheHelper";

interface Coordinates {
  lat: number;
  lon: number;
}

interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  cloudiness: number;
  visibility: number;
  conditions: WeatherCondition[];
  timestamp: Date;
}

interface ForecastDay {
  date: Date;
  temperature: {
    min: number;
    max: number;
    day: number;
    night: number;
  };
  humidity: number;
  windSpeed: number;
  conditions: WeatherCondition[];
  precipitation: number;
  cloudiness: number;
}

interface WeatherData {
  current: CurrentWeather;
  forecast: ForecastDay[];
  location: {
    name: string;
    country: string;
    coordinates: Coordinates;
  };
}

interface WeatherAlert {
  event: string;
  description: string;
  start: Date;
  end: Date;
  severity: string;
}

class WeatherService {
  private baseUrl = "https://api.open-meteo.com/v1";
  private cacheExpiry = 3600; // 1 hour in seconds

  constructor() {
    // Open-Meteo is free and doesn't require an API key
    console.log("Using Open-Meteo weather service (no API key required)");
  }

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(coordinates: Coordinates): Promise<CurrentWeather> {
    const cacheKey = `weather:current:${coordinates.lat}:${coordinates.lon}`;

    // Check cache first
    const cached = await cacheHelper.get<CurrentWeather>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: coordinates.lat,
          longitude: coordinates.lon,
          current: "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code",
          timezone: "auto",
        },
      });

      const weather = this.mapOpenMeteoCurrentWeather(response.data);

      // Cache the result
      await cacheHelper.set(cacheKey, weather, this.cacheExpiry);

      return weather;
    } catch (error) {
      console.error("Open-Meteo current weather error:", error);
      throw new Error("Failed to fetch current weather");
    }
  }

  /**
   * Get weather forecast for multiple days
   */
  async getForecast(
    coordinates: Coordinates,
    days: number = 5
  ): Promise<ForecastDay[]> {
    const cacheKey = `weather:forecast:${coordinates.lat}:${coordinates.lon}:${days}`;

    // Check cache first
    const cached = await cacheHelper.get<ForecastDay[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          latitude: coordinates.lat,
          longitude: coordinates.lon,
          daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
          timezone: "auto",
          forecast_days: days,
        },
      });

      const forecast = this.mapOpenMeteoForecast(response.data);

      // Cache the result
      await cacheHelper.set(cacheKey, forecast, this.cacheExpiry);

      return forecast;
    } catch (error) {
      console.error("Open-Meteo forecast error:", error);
      throw new Error("Failed to fetch weather forecast");
    }
  }

  /**
   * Get complete weather data (current + forecast)
   */
  async getWeatherData(
    coordinates: Coordinates,
    locationName?: string
  ): Promise<WeatherData> {
    try {
      const [current, forecast] = await Promise.all([
        this.getCurrentWeather(coordinates),
        this.getForecast(coordinates),
      ]);

      return {
        current,
        forecast,
        location: {
          name: locationName || "Unknown",
          country: "",
          coordinates,
        },
      };
    } catch (error) {
      console.error("Weather data fetch error:", error);
      throw new Error("Failed to fetch weather data");
    }
  }

  /**
   * Get weather for a date range
   */
  async getWeatherForDateRange(
    coordinates: Coordinates,
    startDate: Date,
    endDate: Date
  ): Promise<ForecastDay[]> {
    const forecast = await this.getForecast(coordinates, 5);

    // Filter forecast for the date range
    return forecast.filter((day) => {
      const dayDate = new Date(day.date);
      return dayDate >= startDate && dayDate <= endDate;
    });
  }

  /**
   * Optimize trip based on weather conditions
   * Returns best days for outdoor activities
   */
  async optimizeTripByWeather(
    coordinates: Coordinates,
    startDate: Date,
    endDate: Date
  ): Promise<{
    bestDays: Date[];
    worstDays: Date[];
    recommendations: string[];
  }> {
    const forecast = await this.getWeatherForDateRange(
      coordinates,
      startDate,
      endDate
    );

    const scoredDays = forecast.map((day) => ({
      date: day.date,
      score: this.calculateWeatherScore(day),
      day,
    }));

    // Sort by score (higher is better)
    scoredDays.sort((a, b) => b.score - a.score);

    const bestDays = scoredDays
      .slice(0, Math.ceil(scoredDays.length / 2))
      .map((d) => d.date);
    const worstDays = scoredDays
      .slice(Math.ceil(scoredDays.length / 2))
      .map((d) => d.date);

    const recommendations = this.generateWeatherRecommendations(forecast);

    return {
      bestDays,
      worstDays,
      recommendations,
    };
  }

  /**
   * Calculate weather score for a day (0-100)
   * Higher score = better weather for outdoor activities
   */
  private calculateWeatherScore(day: ForecastDay): number {
    let score = 100;

    // Temperature score (ideal: 15-25°C)
    const avgTemp = (day.temperature.min + day.temperature.max) / 2;
    if (avgTemp < 10 || avgTemp > 30) {
      score -= 20;
    } else if (avgTemp < 15 || avgTemp > 25) {
      score -= 10;
    }

    // Precipitation penalty
    if (day.precipitation > 5) {
      score -= 30;
    } else if (day.precipitation > 2) {
      score -= 15;
    }

    // Cloudiness penalty
    if (day.cloudiness > 80) {
      score -= 15;
    } else if (day.cloudiness > 50) {
      score -= 5;
    }

    // Wind speed penalty
    if (day.windSpeed > 10) {
      score -= 10;
    }

    // Check for bad weather conditions
    const badConditions = ["Rain", "Thunderstorm", "Snow", "Drizzle"];
    if (day.conditions.some((c) => badConditions.includes(c.main))) {
      score -= 25;
    }

    return Math.max(0, score);
  }

  /**
   * Generate weather-based recommendations
   */
  private generateWeatherRecommendations(forecast: ForecastDay[]): string[] {
    const recommendations: string[] = [];

    // Check for rain
    const rainyDays = forecast.filter((d) => d.precipitation > 2).length;
    if (rainyDays > 0) {
      recommendations.push(
        `Expect rain on ${rainyDays} day(s). Plan indoor activities or bring rain gear.`
      );
    }

    // Check for extreme temperatures
    const hotDays = forecast.filter((d) => d.temperature.max > 30).length;
    if (hotDays > 0) {
      recommendations.push(
        `${hotDays} day(s) will be hot (>30°C). Stay hydrated and plan activities for cooler hours.`
      );
    }

    const coldDays = forecast.filter((d) => d.temperature.min < 10).length;
    if (coldDays > 0) {
      recommendations.push(
        `${coldDays} day(s) will be cold (<10°C). Pack warm clothing.`
      );
    }

    // Check for good weather
    const goodDays = forecast.filter(
      (d) => this.calculateWeatherScore(d) > 80
    ).length;
    if (goodDays > 0) {
      recommendations.push(
        `${goodDays} day(s) have excellent weather for outdoor activities!`
      );
    }

    return recommendations;
  }

  /**
   * Map Open-Meteo current weather response
   */
  private mapOpenMeteoCurrentWeather(data: any): CurrentWeather {
    const current = data.current;
    return {
      temperature: current.temperature_2m || 20,
      feelsLike: current.temperature_2m || 20,
      humidity: current.relative_humidity_2m || 50,
      pressure: 1013,
      windSpeed: current.wind_speed_10m || 0,
      windDirection: current.wind_direction_10m || 0,
      cloudiness: 0,
      visibility: 10000,
      conditions: [{
        id: current.weather_code || 0,
        main: this.getWeatherDescription(current.weather_code || 0),
        description: this.getWeatherDescription(current.weather_code || 0),
        icon: "01d",
      }],
      timestamp: new Date(),
    };
  }

  /**
   * Map Open-Meteo forecast response
   */
  private mapOpenMeteoForecast(data: any): ForecastDay[] {
    const daily = data.daily;
    const forecast: ForecastDay[] = [];

    for (let i = 0; i < daily.time.length; i++) {
      forecast.push({
        date: new Date(daily.time[i]),
        temperature: {
          min: daily.temperature_2m_min[i] || 15,
          max: daily.temperature_2m_max[i] || 25,
          day: (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2 || 20,
          night: daily.temperature_2m_min[i] || 15,
        },
        humidity: 50,
        windSpeed: daily.wind_speed_10m_max[i] || 0,
        conditions: [{
          id: daily.weather_code[i] || 0,
          main: this.getWeatherDescription(daily.weather_code[i] || 0),
          description: this.getWeatherDescription(daily.weather_code[i] || 0),
          icon: "01d",
        }],
        precipitation: daily.precipitation_sum[i] || 0,
        cloudiness: 0,
      });
    }

    return forecast;
  }

  /**
   * Convert WMO weather code to description
   */
  private getWeatherDescription(code: number): string {
    const weatherCodes: Record<number, string> = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Foggy",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow",
      73: "Moderate snow",
      75: "Heavy snow",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with heavy hail",
    };
    return weatherCodes[code] || "Unknown";
  }
}

export default new WeatherService();
