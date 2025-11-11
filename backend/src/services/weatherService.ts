import axios from "axios";
import redisClient from "../config/redis";

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
  private apiKey: string;
  private baseUrl = "https://api.openweathermap.org/data/2.5";
  private cacheExpiry = 3600; // 1 hour in seconds

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || "";
    if (!this.apiKey) {
      console.warn("OpenWeatherMap API key not configured");
    }
  }

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(coordinates: Coordinates): Promise<CurrentWeather> {
    const cacheKey = `weather:current:${coordinates.lat}:${coordinates.lon}`;

    // Check cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lon,
          appid: this.apiKey,
          units: "metric",
        },
      });

      const weather = this.mapCurrentWeather(response.data);

      // Cache the result
      await this.saveToCache(cacheKey, weather);

      return weather;
    } catch (error) {
      console.error("OpenWeatherMap current weather error:", error);
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
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lon,
          appid: this.apiKey,
          units: "metric",
          cnt: days * 8, // 8 data points per day (3-hour intervals)
        },
      });

      const forecast = this.mapForecast(response.data);

      // Cache the result
      await this.saveToCache(cacheKey, forecast);

      return forecast;
    } catch (error) {
      console.error("OpenWeatherMap forecast error:", error);
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
   * Map OpenWeatherMap current weather response
   */
  private mapCurrentWeather(data: any): CurrentWeather {
    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      cloudiness: data.clouds.all,
      visibility: data.visibility,
      conditions: data.weather.map((w: any) => ({
        id: w.id,
        main: w.main,
        description: w.description,
        icon: w.icon,
      })),
      timestamp: new Date(data.dt * 1000),
    };
  }

  /**
   * Map OpenWeatherMap forecast response
   */
  private mapForecast(data: any): ForecastDay[] {
    const dailyData: { [key: string]: any[] } = {};

    // Group forecast data by day
    data.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = [];
      }
      dailyData[date].push(item);
    });

    // Convert to ForecastDay array
    return Object.entries(dailyData).map(([date, items]) => {
      const temps = items.map((i) => i.main.temp);
      const conditions = items[0].weather;

      return {
        date: new Date(date),
        temperature: {
          min: Math.min(...temps),
          max: Math.max(...temps),
          day:
            items.find((i) => {
              const hour = new Date(i.dt * 1000).getHours();
              return hour >= 12 && hour <= 15;
            })?.main.temp || temps[0],
          night:
            items.find((i) => {
              const hour = new Date(i.dt * 1000).getHours();
              return hour >= 0 && hour <= 3;
            })?.main.temp || temps[temps.length - 1],
        },
        humidity: items[0].main.humidity,
        windSpeed: items[0].wind.speed,
        conditions: conditions.map((w: any) => ({
          id: w.id,
          main: w.main,
          description: w.description,
          icon: w.icon,
        })),
        precipitation: items.reduce((sum: number, i: any) => {
          return sum + (i.rain?.["3h"] || 0);
        }, 0),
        cloudiness: items[0].clouds.all,
      };
    });
  }

  /**
   * Cache helper methods
   */
  private async getFromCache(key: string): Promise<any | null> {
    try {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  private async saveToCache(key: string, data: any): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(data), "EX", this.cacheExpiry);
    } catch (error) {
      console.error("Cache save error:", error);
    }
  }
}

export default new WeatherService();
