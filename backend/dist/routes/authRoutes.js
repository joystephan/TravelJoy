"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = __importDefault(require("../controllers/authController"));
const router = (0, express_1.Router)();
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", authController_1.default.register);
/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post("/login", authController_1.default.login);
/**
 * @route   POST /api/auth/password-reset-request
 * @desc    Request password reset email
 * @access  Public
 */
router.post("/password-reset-request", authController_1.default.requestPasswordReset);
/**
 * @route   POST /api/auth/password-reset
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/password-reset", authController_1.default.resetPassword);
/**
 * @route   GET /api/auth/validate
 * @desc    Validate JWT token
 * @access  Public
 */
router.get("/validate", authController_1.default.validateToken);
exports.default = router;
