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

// Attach Socket.io to the same HTTP server
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? "https://link-up-ziig.onrender.com"
      : "http://localhost:5173",
    credentials: true,
  },
});

// Example socket connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server on Render's PORT
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});