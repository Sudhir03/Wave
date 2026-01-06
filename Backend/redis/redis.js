const { createClient } = require("redis");
const dotenv = require("dotenv");

dotenv.config();

const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on("error", function (err) {
  console.error("Redis Client Error", err);
});

const connectRedis = async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
  } catch (err) {
    console.error("❌ Redis Connection Failed:", err);
  }
};

module.exports = { redis, connectRedis };
