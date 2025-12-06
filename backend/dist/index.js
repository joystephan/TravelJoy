"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const tripRoutes_1 = __importDefault(require("./routes/tripRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
const hotelRoutes_1 = __importDefault(require("./routes/hotelRoutes"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "TravelJoy API is running" });
});
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/trips", tripRoutes_1.default);
app.use("/api/chat", chatRoutes_1.default);
app.use("/api/hotels", hotelRoutes_1.default);
// 404 handler for undefined routes
app.use(errorHandler_1.notFoundHandler);
// Global error handler (must be last)
app.use(errorHandler_1.errorHandler);
// Start server - listen on all interfaces (0.0.0.0) to allow connections from other devices
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Accessible at: http://localhost:${PORT}`);
    console.log(`Accessible from network at: http://192.168.16.108:${PORT}`);
});
exports.default = app;
