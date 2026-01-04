// =======================
// Core Modules & Packages
// =======================
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

// =======================
// Custom Utilities & Error Handling
// =======================
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

// =======================
// Routes
// =======================
const userRoutes = require("./routes/userRoutes");
const friendRoutes = require("./routes/friendRoutes");
const chatRoutes = require("./routes/chatRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const conversationPreferenceRoutes = require("./routes/conversationPreferenceRoutes");
const blockRoutes = require("./routes/blockRoutes");

const app = express();

// =======================
// Trust Proxy
// =======================
app.set("trust proxy", 1);

// =======================
// Rate Limiter
// =======================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many requests, please try again later",
});
// app.use("/api", limiter);

// =======================
// CORS CONFIG (FIXED)
// =======================
const allowedOrigins = [process.env.FRONTEND_URL];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman, server-to-server, curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =======================
// Body Parser
// =======================
app.use(express.json({ limit: "10kb" }));

// =======================
// Logger
// =======================
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =======================
// Health Check
// =======================
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    isSuccess: true,
    message: "Backend is live and working",
  });
});

// =======================
// API Routes
// =======================
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/conversation-preferences", conversationPreferenceRoutes);
app.use("/api/block", blockRoutes);

// =======================
// 404 Handler
// =======================
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// =======================
// Global Error Handler
// =======================
app.use(globalErrorHandler);

module.exports = app;
