// =======================
// Imports – Logger, Redis, Models
// =======================
const logger = require("../utils/logger");
const { redis } = require("./redis");
const User = require("../models/userModel");

// =======================
// Update lastSeen in MongoDB
// =======================
async function updateLastSeenInDB(userId, timestamp) {
  try {
    await User.updateOne(
      { _id: userId },
      { $set: { lastSeen: new Date(timestamp) } }
    );
  } catch (err) {
    logger.error("❌ Failed to update lastSeen in DB", err);
  }
}

// =======================
// Redis Keys & Constants
// =======================
const PRESENCE_KEY = (userId) => `presence:${userId}`;
const SOCKETS_KEY = (userId) => `sockets:${userId}`;
const PRESENCE_TTL = 60;

// =======================
// Call Busy Key
// =======================
const CALL_BUSY_KEY = (userId) => `call_busy:${userId}`;
const CALL_BUSY_TTL = 90;

// =======================
// INTERNAL HELPERS
// =======================
async function updatePresence(userId, data = {}) {
  const key = PRESENCE_KEY(userId);

  const status = String(data.status ?? "offline");
  const activeChatId = String(data.activeChatId ?? "none");
  const lastSeen = String(data.lastSeen ?? Date.now());

  try {
    await Promise.all([
      redis.hSet(key, "status", status),
      redis.hSet(key, "activeChatId", activeChatId),
      redis.hSet(key, "lastSeen", lastSeen),
      redis.expire(key, PRESENCE_TTL),
    ]);
  } catch (error) {
    logger.error("❌ Failed to update presence in Redis", error);
  }
}

async function setOnline(userId, socketId) {
  await redis.sAdd(SOCKETS_KEY(userId), socketId);
  await redis.expire(SOCKETS_KEY(userId), PRESENCE_TTL);

  await updatePresence(userId, {
    status: "online",
    activeChatId: "none",
  });
}

async function setInChat(userId, chatId) {
  await updatePresence(userId, {
    status: "in_chat",
    activeChatId: String(chatId),
  });
}

async function setOnlineFromChat(userId) {
  await updatePresence(userId, {
    status: "online",
    activeChatId: "none",
  });
}

async function handleDisconnect(userId, socketId) {
  await redis.sRem(SOCKETS_KEY(userId), socketId);

  const sockets = await redis.sMembers(SOCKETS_KEY(userId));

  if (sockets.length === 0) {
    const now = Date.now();

    await updatePresence(userId, {
      status: "offline",
      activeChatId: "none",
      lastSeen: String(now),
    });

    await updateLastSeenInDB(userId, now);
    return true;
  }

  return false;
}

async function getPresence(userId) {
  const presence = await redis.hGetAll(PRESENCE_KEY(userId));

  if (!presence || Object.keys(presence).length === 0) {
    return {
      status: "offline",
      activeChatId: "none",
      lastSeen: "",
    };
  }

  return presence;
}

async function isUserOnline(userId) {
  const presence = await redis.hGetAll(PRESENCE_KEY(userId));
  return presence?.status === "online" || presence?.status === "in_chat";
}

// =======================
// CALL BUSY HELPERS
// =======================
async function setUserBusy(userId, callId) {
  await redis.set(CALL_BUSY_KEY(userId), String(callId), { EX: CALL_BUSY_TTL });
}

async function clearUserBusy(userId) {
  await redis.del(CALL_BUSY_KEY(userId));
}

async function isUserBusy(userId) {
  return (await redis.exists(CALL_BUSY_KEY(userId))) === 1;
}

// =======================
// Exports
// =======================
module.exports = {
  setOnline,
  setInChat,
  setOnlineFromChat,
  handleDisconnect,
  getPresence,
  isUserOnline,
  setUserBusy,
  clearUserBusy,
  isUserBusy,
};
