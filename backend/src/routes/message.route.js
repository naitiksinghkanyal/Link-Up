import express from "express";
import { protectRoute } from "../middelware/auth.middelware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

/**
 * - /users - get the user on the sidebar 
 * - /:id - get all the messages
 * - /send/:id - send the message 
 */
router.get("/users", protectRoute,getUsersForSidebar);
router.get("/:id", protectRoute,getMessages);
router.post("/send/:id", protectRoute,sendMessage);



export default router;