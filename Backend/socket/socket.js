const { Server } = require("socket.io");
const Message = require("../models/messageModel");

let io;

const socketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.SERVER_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", async (socket) => {
    console.log("Socket connected:", socket.id);

    // 🔑 USER ID FROM FRONTEND
    const userId = socket.handshake.auth?.userId;
    if (userId) {
      // ✅ USER PERSONAL ROOM (for future use)
      socket.join(userId.toString());

      // =====================================================
      // 🔥 DELIVERED LOGIC (ON APP OPEN / SOCKET CONNECT)
      // =====================================================
      const undeliveredMessages = await Message.find({
        receiver: userId,
        status: "sent",
      });

      if (undeliveredMessages.length > 0) {
        // 1️⃣ Update DB
        await Message.updateMany(
          { receiver: userId, status: "sent" },
          {
            status: "delivered",
            deliveredAt: new Date(),
          }
        );

        // 2️⃣ Notify SENDERS
        undeliveredMessages.forEach((msg) => {
          io.to(msg.conversationId.toString()).emit("message_delivered", {
            conversationId: msg.conversationId,
            messageId: msg._id,
          });
        });
      }
    }

    // ===============================
    // JOIN / LEAVE CHAT
    // ===============================
    socket.on("join_chat", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("leave_chat", (conversationId) => {
      socket.leave(conversationId);
    });

    // ===============================
    // TYPING INDICATOR
    // ===============================
    socket.on("typing_start", (conversationId) => {
      socket.to(conversationId).emit("user_typing_start");
    });

    socket.on("typing_stop", (conversationId) => {
      socket.to(conversationId).emit("user_typing_stop");
    });

    // ===============================
    // READ STATUS
    // ===============================
    socket.on("message_read", async ({ conversationId, messageId }) => {
      await Message.findByIdAndUpdate(messageId, {
        status: "read",
        readAt: new Date(),
      });

      socket.to(conversationId).emit("message_read", {
        conversationId,
        messageId,
      });
    });

    // ===============================
    // DISCONNECT
    // ===============================
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { socketServer, getIO };
