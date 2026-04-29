import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

// ============================================
// Import Routes
// ============================================
import authRoutes from "./routes/auth.routes.js";
import ChatRouter from "./routes/chat.routes.js";

// ============================================
// Import Middleware & Error Handlers
// ============================================
import { errorHandler, notFoundHandler } from "./utils/errorHandler.js";
import awakeAndChill from "./others/isServerAlive.js";

// ============================================
// Initialize Express App
// ============================================
const app = express();

// ============================================
// Middleware Configuration
// ============================================

/**
 * CORS Configuration
 * - Allows requests from frontend
 * - Configurable via environment or default to localhost
 */
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      `http://localhost:${process.env.Frontend_PORT || 5173}`,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ============================================
// Setting up logger for info
// ============================================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/**
 * Body Parser Middleware
 * - Parses incoming JSON request bodies (limit: 10mb)
 * - Parses incoming form-encoded request bodies
 * - Parses cookies from Cookie header
 */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// ============================================
// Health Check Endpoint
// ============================================

app.get("/", (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = Math.floor(uptime % 60);

  res.status(200).send(awakeAndChill(hours, mins, secs));
});

/**
 * Health Check Route
 * - Verifies server is running
 * - Used for monitoring and tests
 * Endpoint: GET /api/health
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "✅ Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ============================================
// API Routes
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/chats", ChatRouter);

// ============================================
// Error Handling & 404
// ============================================

/**
 * 404 Not Found Handler
 * - Catches all undefined routes
 * - Must be before error handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 * - Catches all errors from routes and middleware
 * - Formats error responses consistently
 * - Logs errors for debugging
 */
app.use(errorHandler);

export default app;
