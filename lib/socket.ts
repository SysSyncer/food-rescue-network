// lib/socket.ts
import { Server } from "socket.io";
import { NextApiResponse } from "next";

let io: Server | null = null;

export function initializeSocket(res: NextApiResponse) {
  if (!io) {
    io = new Server(res.socket!.server, {
      path: "/api/socket",
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    console.log("WebSocket server initialized");

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}
