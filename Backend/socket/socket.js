const { Server } = require("socket.io");

let io;

const socketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.SERVER_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_chat", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("leave_chat", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("typing_start", (conversationId) => {
      socket.to(conversationId).emit("user_typing_start");
    });

    socket.on("typing_stop", (conversationId) => {
      socket.to(conversationId).emit("user_typing_stop");
    });

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
