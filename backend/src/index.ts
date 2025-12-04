import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import tripRoutes from "./routes/tripRoutes";
import chatRoutes from "./routes/chatRoutes";
import hotelRoutes from "./routes/hotelRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

// Middleware
app.use(cors());

// Webhook route needs raw body for Stripe signature verification
app.use("/api/subscription/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "TravelJoy API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/hotels", hotelRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Start server - listen on all interfaces (0.0.0.0) to allow connections from other devices
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Accessible at: http://localhost:${PORT}`);
  console.log(`Accessible from network at: http://192.168.16.108:${PORT}`);
});

export default app;
