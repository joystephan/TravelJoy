import { Router } from "express";
import authController from "../controllers/authController";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   POST /api/auth/password-reset-request
 * @desc    Request password reset email
 * @access  Public
 */
router.post("/password-reset-request", authController.requestPasswordReset);

/**
 * @route   POST /api/auth/password-reset
 * @desc    Reset password with token
 * @access  Public
 */
router.post("/password-reset", authController.resetPassword);

/**
 * @route   GET /api/auth/validate
 * @desc    Validate JWT token
 * @access  Public
 */
router.get("/validate", authController.validateToken);

export default router;
