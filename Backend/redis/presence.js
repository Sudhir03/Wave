// =======================
// Imports – Logger, Redis, Models
// =======================
const logger = require("../utils/logger");
const redis = require("./redis");
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
    console.error("❌ Failed to update lastSeen in DB", err);
  }
}

// =======================
// Redis Keys & Constants
// =======================
const PRESENCE_KEY = (userId) => `presence:${userId}`;
const SOCKETS_KEY = (userId) => `sockets:${userId}`;
const PRESENCE_TTL = 60; // seconds

/* ======================================================
   INTERNAL HELPER
   - Redis v4 compatible
   - Ensures all values are strings
   - Uses pipeline-style Promise batching
====================================================== */
async function updatePresence(userId, data = {}) {
  const key = PRESENCE_KEY(userId);

  // Normalize values (Redis stores strings only)
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
    console.error("❌ Failed to update presence in Redis", error);
  }
}

/* ======================================================
   USER COMES ONLINE
   - Multi-tab safe using socket set
====================================================== */
async function setOnline(userId, socketId) {
  // Track active sockets
  await redis.sAdd(SOCKETS_KEY(userId), socketId);
  await redis.expire(SOCKETS_KEY(userId), PRESENCE_TTL);

  await updatePresence(userId, {
    status: "online",
    activeChatId: "none",
  });
}

/* ======================================================
   USER ENTERS A CHAT
====================================================== */
async function setInChat(userId, chatId) {
  await updatePresence(userId, {
    status: "in_chat",
    activeChatId: String(chatId),
  });
}

/* ======================================================
   USER LEAVES CHAT (STILL ONLINE)
====================================================== */
async function setOnlineFromChat(userId) {
  await updatePresence(userId, {
    status: "online",
    activeChatId: "none",
  });
}

/* ======================================================
   SOCKET DISCONNECT
   - Handles multi-tab scenarios
   - Updates DB only when fully offline
====================================================== */
async function handleDisconnect(userId, socketId) {
  // Remove disconnected socket
  await redis.sRem(SOCKETS_KEY(userId), socketId);

  const sockets = await redis.sMembers(SOCKETS_KEY(userId));

  // User fully offline (no active sockets)
  if (sockets.length === 0) {
    const now = Date.now();

    await updatePresence(userId, {
      status: "offline",
      activeChatId: "none",
      lastSeen: String(now),
    });

    // Persist lastSeen in MongoDB
    await updateLastSeenInDB(userId, now);

    return true;
  }

  return false;
}

/* ======================================================
   READ PRESENCE
   - Fallback safe
====================================================== */
async function getPresence(userId) {
  const presence = await redis.hGetAll(PRESENCE_KEY(userId));

  // Normalize empty Redis result
  if (!presence || Object.keys(presence).length === 0) {
    return {
      status: "offline",
      activeChatId: "none",
      lastSeen: "",
    };
  }

  return presence;
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
};
