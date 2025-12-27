const logger = require("../utils/logger");
const redis = require("./redis");

const PRESENCE_KEY = (userId) => `presence:${userId}`;
const SOCKETS_KEY = (userId) => `sockets:${userId}`;
const PRESENCE_TTL = 60; // seconds

/* ======================================================
   INTERNAL HELPER
   (Redis v4 compatible — NO object hSet)
====================================================== */
async function updatePresence(userId, data = {}) {
  const key = PRESENCE_KEY(userId);

  // Ensure we have strings and no undefined values
  const status = String(data.status ?? "offline");
  const activeChatId = String(data.activeChatId ?? "none");
  const lastSeen = String(data.lastSeen ?? Date.now());

  try {
    // Execute multiple individual sets in one batch (Pipeline)
    await Promise.all([
      redis.hSet(key, "status", status),
      redis.hSet(key, "activeChatId", activeChatId),
      redis.hSet(key, "lastSeen", lastSeen),
      redis.expire(key, PRESENCE_TTL),
    ]);

    logger.info(`✅ Presence updated for ${userId}`);
  } catch (error) {
    console.error(`❌ Still failing:`, error);
  }
}

/* ======================================================
   USER COMES ONLINE
====================================================== */
async function setOnline(userId, socketId) {
  // track sockets (multi-tab safe)
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
====================================================== */
async function handleDisconnect(userId, socketId) {
  await redis.sRem(SOCKETS_KEY(userId), socketId);
  const sockets = await redis.sMembers(SOCKETS_KEY(userId));

  // no active sockets → user offline
  if (sockets.length === 0) {
    await updatePresence(userId, {
      status: "offline",
      activeChatId: "none",
      lastSeen: String(Date.now()),
    });
    return true;
  }

  return false;
}

/* ======================================================
   READ PRESENCE
====================================================== */
async function getPresence(userId) {
  const presence = await redis.hGetAll(PRESENCE_KEY(userId));

  // normalize empty result
  if (!presence || Object.keys(presence).length === 0) {
    return {
      status: "offline",
      activeChatId: "none",
      lastSeen: "",
    };
  }

  return presence;
}

module.exports = {
  setOnline,
  setInChat,
  setOnlineFromChat,
  handleDisconnect,
  getPresence,
};
