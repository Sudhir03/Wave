const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const logger = require("./utils/logger");
const { socketServer } = require("./socket/socket");
const { redis, connectRedis } = require("./redis/redis");

dotenv.config();
const app = require("./app");

// =======================
// Load Environment
// =======================
const env = process.env.NODE_ENV || "development";

// =======================
// Config
// =======================
const PORT = process.env.PORT;
const SERVER_URL = process.env.SERVER_URL;
const DB_URI = process.env.DB_URI;

let server;

// =======================
// Handle uncaught exceptions
// =======================
process.on("uncaughtException", (err) => {
  logger.error(`💥 UNCAUGHT EXCEPTION: ${err.name} | ${err.message}`);
  process.exit(1);
});

// =======================
// Create HTTP Server
// (Required for Socket.IO)
// =======================
const httpServer = http.createServer(app);

// =======================
// Initialize Socket.IO
// =======================
socketServer(httpServer);

// =======================
// Connect MongoDB
// =======================
const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await mongoose.connect(DB_URI, {
        dbName: process.env.DB_NAME,
      });

      startServer();
      return;
    } catch (err) {
      logger.warn(
        `🔁 Retry MongoDB connection (${6 - retries}/5): ${err.message}`
      );
      retries--;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }

  logger.error("❌ All MongoDB connection attempts failed.");
  process.exit(1);
};

// =======================
// Start Server
// =======================
const startServer = () => {
  server = httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running at ${SERVER_URL + `:` + PORT} [${env}]`);

    if (env === "production") {
      console.log(`✔️ Server started on port ${PORT} [production]`);
    }
  });
};

// =======================
// Graceful Shutdowns
// =======================
process.on("unhandledRejection", (err) => {
  logger.error(`💥 UNHANDLED REJECTION: ${err.name} | ${err.message}`);
  shutdown(1);
});

process.on("SIGTERM", () => {
  logger.info("📦 SIGTERM received. Shutting down gracefully...");
  shutdown(0);
});

const shutdown = async (exitCode) => {
  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }

    await mongoose.connection.close();
    logger.info("📴 MongoDB connection closed");

    if (redis.isOpen) {
      await redis.quit();
      logger.info("📴 Redis connection closed");
    }

    process.exit(exitCode);
  } catch (err) {
    logger.error(`❌ Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

// =======================
// Init
// =======================
const initApp = async () => {
  await connectDB();
  await connectRedis();
};

initApp();
