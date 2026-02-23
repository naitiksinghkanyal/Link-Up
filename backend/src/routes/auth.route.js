import express from "express";
import { login, logout, signup, updateProfile, checkAuth } from "../controllers/auth.controller.js";
import { protectRoute } from "../middelware/auth.middelware.js";

const router = express.Router();

/** 
 * - Authentication Routes for signUp , logIn and logOut 
 */
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


/**
 * - PUT request for updating the profile picture of the account 
 */
router.put("/update-profile", protectRoute, updateProfile);



router.get("/check", protectRoute, checkAuth);

export default router;