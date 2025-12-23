import { Router } from "express";
import weatherController from "../controllers/weatherController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// All weather routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/weather
 * @desc    Get current weather for a location
 * @access  Private
 * @query   latitude, longitude
 */
router.get("/", (req, res) => weatherController.getCurrentWeather(req, res));

/**
 * @route   GET /api/weather/forecast
 * @desc    Get weather forecast for multiple days
 * @access  Private
 * @query   latitude, longitude, days (optional, default 5)
 */
router.get("/forecast", (req, res) => weatherController.getForecast(req, res));

/**
 * @route   GET /api/weather/complete
 * @desc    Get complete weather data (current + forecast)
 * @access  Private
 * @query   latitude, longitude, location (optional)
 */
router.get("/complete", (req, res) => weatherController.getCompleteWeather(req, res));

export default router;

