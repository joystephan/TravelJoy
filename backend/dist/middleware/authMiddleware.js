"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
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
        const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key";
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
            },
        });
        if (!user) {
            res.status(401).json({
                error: {
                    code: "UNAUTHORIZED",
                    message: "User not found",
                },
            });
            return;
        }
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({
            error: {
                code: "UNAUTHORIZED",
                message: error instanceof jsonwebtoken_1.default.JsonWebTokenError
                    ? "Invalid or expired token"
                    : "Authentication failed",
            },
        });
    }
};
exports.authMiddleware = authMiddleware;
