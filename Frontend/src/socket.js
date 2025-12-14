import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected to socket:", socket.id);
});

/**
 * 🔁 Attach userId & RECONNECT once
 * (ChatDetail continues using same socket instance)
 */
export const attachUserToSocket = (userId) => {
  if (!userId) return;

  // prevent infinite reconnect loop
  if (socket.auth?.userId === userId) return;

  socket.auth = { userId };

  if (socket.connected) {
    socket.disconnect();
  }

  socket.connect(); // 🔥 reconnect WITH auth
};

export default socket;
