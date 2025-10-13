const { createLogger, format, transports } = require("winston");
const path = require("path");
const fs = require("fs");

const env = process.env.NODE_ENV || "development";

// ✅ Logs directory path
const logsDir = path.join(__dirname, "../logs");

// ✅ Create logs directory if not exists (only in prod)
if (env === "production" && !fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  })
);

const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    ...(env === "development"
      ? [
          // ✅ Dev: log to console only
          new transports.Console({
            format: format.combine(format.colorize(), logFormat),
          }),
        ]
      : [
          // ✅ Prod: log to files only
          new transports.File({
            filename: path.join(logsDir, "error.log"),
            level: "error",
          }),
          new transports.File({
            filename: path.join(logsDir, "combined.log"),
          }),
        ]),
  ],
});

module.exports = logger;
