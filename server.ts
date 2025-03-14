import express from "express";
import http from "http";
import { Server } from "socket.io";

const PORT = 4000;

// Use a global variable to prevent multiple instances
declare global {
  var _io: Server | undefined;
  var _connectedUsers: Map<string, string> | undefined;
}

if (!global._io) {
  console.log("Starting WebSocket server...");

  const app = express();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: {
      origin: "*", // Adjust for security
      methods: ["GET", "POST"],
    },
  });

  const connectedUsers = new Map<string, string>(); // Stores userId -> socketId mapping

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register", (userId) => {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      connectedUsers.forEach((id, key) => {
        if (id === socket.id) connectedUsers.delete(key);
      });
      console.log("User disconnected:", socket.id);
    });
  });

  // Start server only once
  server.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
  });

  // Store in global variables to prevent duplicate instances
  global._io = io;
  global._connectedUsers = connectedUsers;
} else {
  console.log("WebSocket server already running. Skipping initialization.");
}

// Export the global instance
export const io = global._io!;
export const connectedUsers = global._connectedUsers!;
