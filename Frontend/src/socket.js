import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected to socket:", socket.id);
});

export default socket;
