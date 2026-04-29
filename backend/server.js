import app from "./src/app.js";
import { connectDB, disconnectDB } from "./src/config/database.js";
import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";
import { startKeepAlive, stopKeepAlive } from "./src/utils/keepAlive.js";

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============================================
// Create HTTP server (for Socket IO)
// ============================================
const httpServer = http.createServer(app);
initSocket(httpServer);

// ============================================
// Server Initialization
// ============================================
let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();

    // Start HTTP server
    server = httpServer.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║  🚀 Server Started Successfully!           ║
╠════════════════════════════════════════════╣
║  Port:     ${PORT}                            ╣
║  Environment: ${NODE_ENV}                  ╣
║  URL:      http://localhost:${PORT}           ╣
╚════════════════════════════════════════════╝
      `);

      // Start keep-alive pinger to prevent Render cold boot
      startKeepAlive();
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// ============================================
// Graceful Shutdown Handler
// ============================================
const gracefulShutdown = async (signal) => {
  console.log(`\n📴 Received ${signal}, shutting down gracefully...`);

  try {
    // Close HTTP server
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          console.log("✅ HTTP server closed");
          resolve();
        });
      });
    }

    // Stop keep-alive pinger
    stopKeepAlive();

    // Disconnect from MongoDB
    await disconnectDB();
    console.log("✅ Shutdown complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error.message);
    process.exit(1);
  }
};

// ============================================
// Process Event Listeners
// ============================================
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

// ============================================
// Start the server
// ============================================
startServer();
