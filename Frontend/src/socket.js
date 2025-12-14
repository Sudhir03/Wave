import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected to socket:", socket.id);
});

export default socket;
