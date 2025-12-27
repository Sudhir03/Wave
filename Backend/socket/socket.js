const { Server } = require("socket.io");
const {
  setOnline,
  setInChat,
  setOnlineFromChat,
  handleDisconnect,
} = require("../redis/presence");

const Message = require("../models/messageModel");
const logger = require("../utils/logger");

let io;

const socketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    logger.info(`🔗 Socket connected: ${socket.id}`);

    socket.on("register_user", async ({ userId }) => {
      socket.userId = userId;
      await setOnline(userId, socket.id);

      // 🔥 ADD THIS BLOCK
      const undeliveredMessages = await Message.find({
        receiver: userId,
        status: "sent",
      });

      for (const msg of undeliveredMessages) {
        await Message.updateOne({ _id: msg._id }, { status: "delivered" });

        socket.to(msg.conversationId.toString()).emit("message_status_update", {
          messageIds: [msg._id],
          status: "delivered",
        });
      }
    });

    socket.on("join_chat", async ({ chatId, userId }) => {
      socket.userId = userId;
      await setInChat(userId, chatId);
      socket.join(chatId);

      // 🔥 MARK DELIVERED → READ
      const unreadMessages = await Message.find({
        conversationId: chatId,
        receiver: userId,
        status: { $ne: "read" },
      }).select("_id");

      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map((m) => m._id);

        await Message.updateMany(
          { _id: { $in: messageIds } },
          { status: "read" }
        );

        // 🔔 NOTIFY SENDER
        socket.to(chatId).emit("message_status_update", {
          messageIds,
          status: "read",
        });
      }
    });

    socket.on("leave_chat", async ({ chatId, userId }) => {
      socket.userId = userId;

      socket.leave(chatId);
      await setOnlineFromChat(userId);
    });

    socket.on("typing_start", (chatId) => {
      socket.to(chatId).emit("user_typing_start");
    });

    socket.on("typing_stop", (chatId) => {
      socket.to(chatId).emit("user_typing_stop");
    });

    socket.on("disconnect", async () => {
      if (!socket.userId) return;

      const wentOffline = await handleDisconnect(socket.userId, socket.id);

      if (wentOffline) {
        socket.broadcast.emit("presence_update", {
          userId: socket.userId,
          status: "offline",
          lastSeen: Date.now(),
        });
      }
    });
  });
};

// ✅ ADD THIS
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  socketServer,
  getIO,
};
