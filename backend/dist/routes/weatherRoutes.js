"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weatherController_1 = __importDefault(require("../controllers/weatherController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// All weather routes require authentication
router.use(authMiddleware_1.authMiddleware);
/**
 * @route   GET /api/weather
 * @desc    Get current weather for a location
 * @access  Private
 * @query   latitude, longitude
 */
router.get("/", (req, res) => weatherController_1.default.getCurrentWeather(req, res));
/**
 * @route   GET /api/weather/forecast
 * @desc    Get weather forecast for multiple days
 * @access  Private
 * @query   latitude, longitude, days (optional, default 5)
 */
router.get("/forecast", (req, res) => weatherController_1.default.getForecast(req, res));
/**
 * @route   GET /api/weather/complete
 * @desc    Get complete weather data (current + forecast)
 * @access  Private
 * @query   latitude, longitude, location (optional)
 */
router.get("/complete", (req, res) => weatherController_1.default.getCompleteWeather(req, res));
exports.default = router;
