import express from "express";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// CORS for frontend
const FRONTEND_URL = process.env.NODE_ENV === "production"
  ? "https://link-up-ziig.onrender.com" //  deployed URL
  : "http://localhost:5173";

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
}));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

export default app;