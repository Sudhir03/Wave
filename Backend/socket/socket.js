import { Server } from "socket.io";

const socketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // Join chat room
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined room: ${chatId}`);
    });

    // Send message
    socket.on("send_message", (data) => {
      io.to(data.chatId).emit("receive_message", data);
    });

    // Typing indicator (optional)
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("user_typing");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export default socketServer;
