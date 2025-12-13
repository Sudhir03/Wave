import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import logger from "./utils/logger.js";
import socketServer from "./socket/socket.js";
import app from "./app.js";

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`💥 UNCAUGHT EXCEPTION: ${err.name} | ${err.message}`);
  process.exit(1);
});

// Load env
dotenv.config();
const env = process.env.NODE_ENV || "development";

// Config
const PORT = process.env.PORT || 5000;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;
const DB_URI = process.env.DB_URI;

let server;

// Create HTTP server (IMPORTANT for Socket.IO)
const httpServer = http.createServer(app);

// Initialize socket server
socketServer(httpServer);

// Connect to MongoDB
const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await mongoose.connect(DB_URI, {
        dbName: process.env.DB_NAME,
      });

      logger.info("✅ MongoDB connected successfully");
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

const startServer = () => {
  server = httpServer.listen(PORT, () => {
    logger.info(`🚀 Server running at ${SERVER_URL} [${env}]`);

    if (env === "production") {
      console.log(`✔️  Server started on port ${PORT} [production]`);
    }
  });
};

// Graceful shutdowns
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

    process.exit(exitCode);
  } catch (err) {
    logger.error(`❌ Error during shutdown: ${err.message}`);
    process.exit(1);
  }
};

// Init everything
connectDB();
