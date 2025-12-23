import { Request, Response } from "express";
import weatherService from "../services/weatherService";

export class WeatherController {
  /**
   * Get current weather for a location
   * GET /api/weather?latitude=X&longitude=Y
   */
  async getCurrentWeather(req: Request, res: Response) {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: "Missing required parameters: latitude and longitude",
        });
      }

      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({
          error: "Invalid latitude or longitude values",
        });
      }

      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({
          error: "Latitude must be between -90 and 90, longitude between -180 and 180",
        });
      }

      const weather = await weatherService.getCurrentWeather({ lat, lon });

      // Format response for mobile app
      const response = {
        temperature: Math.round(weather.temperature),
        condition: weather.conditions[0]?.description || weather.conditions[0]?.main || "Unknown",
        icon: weather.conditions[0]?.icon || "01d",
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Weather controller error:", error);
      res.status(500).json({
        error: "Failed to fetch weather data",
        message: error.message,
      });
    }
  }

  /**
   * Get weather forecast for multiple days
   * GET /api/weather/forecast?latitude=X&longitude=Y&days=5
   */
  async getForecast(req: Request, res: Response) {
    try {
      const { latitude, longitude, days = "5" } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: "Missing required parameters: latitude and longitude",
        });
      }

      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);
      const numDays = parseInt(days as string, 10);

      if (isNaN(lat) || isNaN(lon) || isNaN(numDays)) {
        return res.status(400).json({
          error: "Invalid parameter values",
        });
      }

      // Validate coordinate ranges
      if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return res.status(400).json({
          error: "Latitude must be between -90 and 90, longitude between -180 and 180",
        });
      }

      // Limit days to reasonable range
      const limitedDays = Math.min(Math.max(1, numDays), 16);

      const forecast = await weatherService.getForecast({ lat, lon }, limitedDays);

      // Format response for mobile app
      const response = forecast.map((day) => ({
        date: day.date,
        temperature: Math.round(day.temperature.day),
        temperatureMin: Math.round(day.temperature.min),
        temperatureMax: Math.round(day.temperature.max),
        condition: day.conditions[0]?.description || day.conditions[0]?.main || "Unknown",
        icon: day.conditions[0]?.icon || "01d",
        precipitation: day.precipitation,
        humidity: day.humidity,
        windSpeed: day.windSpeed,
      }));

      res.json(response);
    } catch (error: any) {
      console.error("Weather forecast controller error:", error);
      res.status(500).json({
        error: "Failed to fetch weather forecast",
        message: error.message,
      });
    }
  }

  /**
   * Get complete weather data (current + forecast)
   * GET /api/weather/complete?latitude=X&longitude=Y&location=Name
   */
  async getCompleteWeather(req: Request, res: Response) {
    try {
      const { latitude, longitude, location } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: "Missing required parameters: latitude and longitude",
        });
      }

      const lat = parseFloat(latitude as string);
      const lon = parseFloat(longitude as string);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({
          error: "Invalid latitude or longitude values",
        });
      }

      const weatherData = await weatherService.getWeatherData(
        { lat, lon },
        location as string
      );

      // Format response for mobile app
      const response = {
        current: {
          temperature: Math.round(weatherData.current.temperature),
          condition: weatherData.current.conditions[0]?.description || "Unknown",
          icon: weatherData.current.conditions[0]?.icon || "01d",
          humidity: weatherData.current.humidity,
          windSpeed: weatherData.current.windSpeed,
        },
        forecast: weatherData.forecast.map((day) => ({
          date: day.date,
          temperature: Math.round(day.temperature.day),
          temperatureMin: Math.round(day.temperature.min),
          temperatureMax: Math.round(day.temperature.max),
          condition: day.conditions[0]?.description || "Unknown",
          icon: day.conditions[0]?.icon || "01d",
          precipitation: day.precipitation,
        })),
        location: weatherData.location,
      };

      res.json(response);
    } catch (error: any) {
      console.error("Complete weather controller error:", error);
      res.status(500).json({
        error: "Failed to fetch complete weather data",
        message: error.message,
      });
    }
  }
}

export default new WeatherController();

