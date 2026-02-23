// server.js
import dotenv from "dotenv";
dotenv.config();

import http from "http";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import app from "./src/app.js";
import { connectToDB } from "./src/lib/db.js";

// __dirname fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB first
connectToDB();

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Create HTTP server with Express
const httpServer = http.createServer(app);

// Attach Socket.io
export const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://link-up-ziig.onrender.com"
        : "http://localhost:5173",
    credentials: true,
  },
});

// Store online users
const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle messages
  socket.on("send_message", ({ toUserId, message }) => {
    const receiverSocketId = userSocketMap[toUserId];

    // Emit to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", message);
    }

    // Emit back to sender so their UI updates instantly
    io.to(socket.id).emit("receive_message", message);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});