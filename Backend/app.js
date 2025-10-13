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
const { log } = require("winston");

// =======================
// Routes
// =======================

const app = express();

// =======================
// Global Middleware
// =======================

// Trust reverse proxy (e.g., for secure cookies behind Nginx, Heroku)
app.set("trust proxy", 1);

// Rate limiter (apply to all /api/* routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 100 requests
  message: "Oops! Too many requests. Let’s slow down and try again shortly",
});
app.use("/api", limiter);

// Enable CORS for frontend origin
const allowedOrigins = [process.env.FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Parse incoming JSON payloads
app.use(express.json());

// Log HTTP requests (only in development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// =======================
// Health Check Route
// =======================
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    isSuccess: true,
    message: "Backend is live and working",
  });
});

// =======================
// Application Routes
// =======================

// =======================
// Handle Unmatched Routes
// =======================
app.use((req, res, next) => {
  return next(new AppError("The requested resource was not found", 404));
});

// =======================
// Global Error Handler
// =======================
app.use(globalErrorHandler);

module.exports = app;
