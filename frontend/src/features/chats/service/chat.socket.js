import { io } from "socket.io-client";

export const initializeSocketConnection = () => {
  const socket = io("http://localhost:4000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to Socket.IO server", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from Socket.IO server");
  });

  return socket;
};
