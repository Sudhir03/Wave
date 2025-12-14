const { Server } = require("socket.io");

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined room: ${chatId}`);
    });

    socket.on("send_message", (data) => {
      io.to(data.chatId).emit("receive_message", data);
    });

    socket.on("typing_start", (chatId) => {
      socket.to(chatId).emit("user_typing_start");
    });

    socket.on("typing_stop", (chatId) => {
      socket.to(chatId).emit("user_typing_stop");
    });

    socket.on("leave_chat", (chatId) => {
      socket.leave(chatId);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = socketServer;
