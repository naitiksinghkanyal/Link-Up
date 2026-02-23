import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// CORS origin must match frontend
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

// used to store online users
const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // userId sent from frontend when connecting
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // Emit current online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // === Listen for messages from clients ===
  socket.on("send_message", ({ toUserId, message }) => {
    console.log(`Message from ${userId} to ${toUserId}:`, message);

    const receiverSocketId = userSocketMap[toUserId];
    if (receiverSocketId) {
      // Send message to the specific receiver
      io.to(receiverSocketId).emit("receive_message", {
        fromUserId: userId,
        message,
      });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };