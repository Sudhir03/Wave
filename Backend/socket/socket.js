// =======================
// Imports – Socket & Utils
// =======================
const { Server } = require("socket.io");

// =======================
// Imports – Presence (Redis)
// =======================
const {
  setOnline,
  setInChat,
  setOnlineFromChat,
  handleDisconnect,
} = require("../redis/presence");

// =======================
// Imports – Models & Logger
// =======================
const Message = require("../models/messageModel");
const conversationModel = require("../models/conversationModel");
const logger = require("../utils/logger");

// =======================
// Socket Instance
// =======================
let io;

// =======================
// Helper: Check if User is in Chat Room
// =======================
const isUserInChatRoom = (userId, chatId) => {
  const room = io.sockets.adapter.rooms.get(chatId);
  if (!room) return false;

  for (const socketId of room) {
    const s = io.sockets.sockets.get(socketId);
    if (s?.userId === userId) return true;
  }
  return false;
};

// =======================
// Socket Server Setup
// =======================
const socketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  // =======================
  // Socket Connection
  // =======================
  io.on("connection", (socket) => {
    logger.info(`🔗 Socket connected: ${socket.id}`);

    // =======================
    // Register User (Presence)
    // =======================
    socket.on("register_user", async ({ userId }) => {
      socket.userId = userId;

      // Join personal room (used for chat list updates)
      socket.join(userId);

      // Mark user online in Redis
      await setOnline(userId, socket.id);

      // Deliver undelivered messages
      const undelivered = await Message.find({
        receiver: userId,
        status: "sent",
      });

      for (const msg of undelivered) {
        await Message.updateOne(
          { _id: msg._id, status: "sent" },
          { status: "delivered" }
        );

        socket.to(msg.conversationId.toString()).emit("message_status_update", {
          messageIds: [msg._id],
          status: "delivered",
        });
      }

      // Broadcast online presence
      io.emit("presence_update", {
        userId,
        status: "online",
      });
    });

    // =======================
    // Join Chat Room
    // =======================
    socket.on("join_chat", async ({ chatId, userId }) => {
      socket.userId = userId;
      socket.currentChat = chatId;

      // Mark user as actively chatting
      await setInChat(userId, chatId);

      // Join chat room
      socket.join(chatId);

      // Reset unread count
      await conversationModel.findByIdAndUpdate(chatId, {
        [`unreadCount.${userId}`]: 0,
      });

      // Mark unread messages as read
      const unread = await Message.find({
        conversationId: chatId,
        receiver: userId,
        status: { $ne: "read" },
      }).select("_id");

      if (unread.length) {
        const ids = unread.map((m) => m._id);

        await Message.updateMany(
          { _id: { $in: ids }, status: { $ne: "read" } },
          { status: "read" }
        );

        socket.to(chatId).emit("message_status_update", {
          messageIds: ids,
          status: "read",
        });
      }

      // Notify client to reset unread badge
      socket.emit("conversation_read", { conversationId: chatId });

      // Broadcast in-chat presence
      io.emit("presence_update", {
        userId,
        status: "in_chat",
      });
    });

    // =======================
    // Leave Chat Room
    // =======================
    socket.on("leave_chat", async ({ chatId, userId }) => {
      if (socket.currentChat !== chatId) return;

      socket.leave(chatId);

      // Move user back to online (not in chat)
      await setOnlineFromChat(userId);

      io.emit("presence_update", {
        userId,
        status: "online",
      });
    });

    // =======================
    // Typing Indicators
    // =======================
    socket.on("typing_start", ({ chatId, userId }) => {
      socket.to(chatId).emit("user_typing_start", { userId });
    });

    socket.on("typing_stop", ({ chatId, userId }) => {
      socket.to(chatId).emit("user_typing_stop", { userId });
    });

    // =======================
    // Heartbeat (Keep Alive)
    // =======================
    socket.on("heartbeat", async ({ userId }) => {
      if (!userId) return;

      socket.userId = userId;

      // Refresh online status in Redis
      await setOnline(userId, socket.id);
    });

    // =======================
    // Disconnect Handling
    // =======================
    socket.on("disconnect", async () => {
      if (!socket.userId) return;

      const wentOffline = await handleDisconnect(socket.userId, socket.id);

      if (wentOffline) {
        io.emit("presence_update", {
          userId: socket.userId,
          status: "offline",
          lastSeen: Date.now(),
        });
      }
    });
  });
};

// =======================
// Get Socket Instance
// =======================
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

// =======================
// Exports
// =======================
module.exports = {
  socketServer,
  getIO,
  isUserInChatRoom,
};
