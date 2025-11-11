"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuthService {
    constructor() {
        this.SALT_ROUNDS = 10;
        this.JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
        this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
        this.REFRESH_TOKEN_EXPIRES_IN = "30d";
    }
    async register(data) {
        // Validate email format
        if (!this.isValidEmail(data.email)) {
            throw new Error("Invalid email format");
        }
        // Validate password strength
        if (!this.isValidPassword(data.password)) {
            throw new Error("Password must be at least 8 characters long and contain uppercase, lowercase, and numbers");
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(data.password, this.SALT_ROUNDS);
        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email.toLowerCase(),
                passwordHash,
                firstName: data.firstName,
                lastName: data.lastName,
            },
        });
        // Generate tokens
        return this.generateAuthTokens(user);
    }
    async login(data) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: data.email.toLowerCase() },
        });
        if (!user) {
            throw new Error("Invalid email or password");
        }
        // Verify password
        const isPasswordValid = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        // Generate tokens
        return this.generateAuthTokens(user);
    }
    async resetPasswordRequest(email) {
        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            // Don't reveal if user exists for security
            return;
        }
        // Generate password reset token (valid for 1 hour)
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, type: "password-reset" }, this.JWT_SECRET, { expiresIn: "1h" });
        // In production, send email with reset link
        // For now, we'll just log it (email service will be implemented separately)
        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Reset link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
    }
    async resetPassword(token, newPassword) {
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
            if (decoded.type !== "password-reset") {
                throw new Error("Invalid token type");
            }
            // Validate new password
            if (!this.isValidPassword(newPassword)) {
                throw new Error("Password must be at least 8 characters long and contain uppercase, lowercase, and numbers");
            }
            // Hash new password
            const passwordHash = await bcrypt_1.default.hash(newPassword, this.SALT_ROUNDS);
            // Update user password
            await prisma.user.update({
                where: { id: decoded.userId },
                data: { passwordHash },
            });
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error("Invalid or expired reset token");
            }
            throw error;
        }
    }
    async validateToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
            // Fetch user from database
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                },
            });
            if (!user) {
                throw new Error("User not found");
            }
            return user;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error("Invalid or expired token");
            }
            throw error;
        }
    }
    generateAuthTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        };
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    isValidPassword(password) {
        // At least 8 characters, one uppercase, one lowercase, one number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
