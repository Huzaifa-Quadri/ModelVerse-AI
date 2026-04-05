import { Server } from "socket.io";

let io; // Declare io variable to hold the Socket.IO server instance - Users will use this to emit events from other parts of the application without needing to pass the io instance around.

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "development"
          ? `http://localhost:${process.env.Frontend_PORT}`
          : process.env.Frontend_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  console.log("⚙️  Socket IO Server is Running....");

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id); //socket id is unique id assiged to each user, changes everytime on reconnect

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
}

export function getIO() {
  if (!io) {
    throw new Error("Socket is not initialized");
  }
  return io;
}
