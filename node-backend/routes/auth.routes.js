import express from "express";
import {
  registerController,
  loginController,
  getProfileController
} from "../controllers/auth.controller.js";
import protect from "../middlewares/auth.middleware.js";

// routes for authentication and authorization
const router = express.Router();
// post request for user registration
router.post("/register", registerController);
// post request for user login
router.post("/login", loginController);
// get request for user profile with auth middleware for token check in header
router.get("/profile", protect, getProfileController);

export default router;