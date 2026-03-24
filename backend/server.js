import app from "./src/app.js";
import { connectDB, disconnectDB } from "./src/config/database.js";

// ============================================
// Configuration
// ============================================

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

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
    server = app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════╗
║  🚀 Server Started Successfully!           ║
╠════════════════════════════════════════════╣
║  Port:     ${PORT}                            ╣
║  Environment: ${NODE_ENV}                  ╣
║  URL:      http://localhost:${PORT}           ╣
╚════════════════════════════════════════════╝
      `);
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
