"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = __importDefault(require("../services/authService"));
class AuthController {
    async register(req, res) {
        try {
            const { email, password, firstName, lastName } = req.body;
            // Validate required fields
            if (!email || !password) {
                res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Email and password are required",
                    },
                });
                return;
            }
            const result = await authService_1.default.register({
                email,
                password,
                firstName,
                lastName,
            });
            res.status(201).json({
                message: "User registered successfully",
                data: result,
            });
        }
        catch (error) {
            console.error("Registration error:", error);
            res.status(400).json({
                error: {
                    code: "REGISTRATION_FAILED",
                    message: error instanceof Error ? error.message : "Registration failed",
                },
            });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Validate required fields
            if (!email || !password) {
                res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Email and password are required",
                    },
                });
                return;
            }
            const result = await authService_1.default.login({ email, password });
            res.status(200).json({
                message: "Login successful",
                data: result,
            });
        }
        catch (error) {
            console.error("Login error:", error);
            res.status(401).json({
                error: {
                    code: "AUTHENTICATION_FAILED",
                    message: error instanceof Error ? error.message : "Authentication failed",
                },
            });
        }
    }
    async requestPasswordReset(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Email is required",
                    },
                });
                return;
            }
            await authService_1.default.resetPasswordRequest(email);
            // Always return success to prevent email enumeration
            res.status(200).json({
                message: "If the email exists, a password reset link has been sent",
            });
        }
        catch (error) {
            console.error("Password reset request error:", error);
            res.status(500).json({
                error: {
                    code: "SERVER_ERROR",
                    message: "Failed to process password reset request",
                },
            });
        }
    }
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                res.status(400).json({
                    error: {
                        code: "VALIDATION_ERROR",
                        message: "Token and new password are required",
                    },
                });
                return;
            }
            await authService_1.default.resetPassword(token, newPassword);
            res.status(200).json({
                message: "Password reset successfully",
            });
        }
        catch (error) {
            console.error("Password reset error:", error);
            res.status(400).json({
                error: {
                    code: "PASSWORD_RESET_FAILED",
                    message: error instanceof Error ? error.message : "Password reset failed",
                },
            });
        }
    }
    async validateToken(req, res) {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.status(401).json({
                    error: {
                        code: "UNAUTHORIZED",
                        message: "No token provided",
                    },
                });
                return;
            }
            const token = authHeader.substring(7);
            const user = await authService_1.default.validateToken(token);
            res.status(200).json({
                message: "Token is valid",
                data: { user },
            });
        }
        catch (error) {
            console.error("Token validation error:", error);
            res.status(401).json({
                error: {
                    code: "INVALID_TOKEN",
                    message: error instanceof Error ? error.message : "Invalid token",
                },
            });
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
