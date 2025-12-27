const { createClient } = require("redis");
const logger = require("../utils/logger");

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", (err) => {
  logger.error(`❌ Redis Error: ${err.message}`);
});

redis.on("connect", () => {
  logger.info("🔌 Redis socket connected");
});

redis.on("ready", () => {
  logger.info("✅ Redis is ready to use");
});

(async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
  } catch (err) {
    logger.error(`❌ Failed to connect Redis: ${err.message}`);
  }
})();

module.exports = redis;
