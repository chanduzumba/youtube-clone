import express from "express";
import protect from "../middlewares/auth.middleware.js";

import {
  createComment,
  getCommentsByVideo,
  getCommentById,
  updateComment,
  deleteComment,
  toggleDislike,
  toggleLike,
} from "../controllers/comment.controller.js";

const router = express.Router();

// route to get all comments for a specific video
router.get("/video/:videoId", getCommentsByVideo);

// route to get a comment by its ID
router.get("/:id", getCommentById);

// protected route to create a new comment
router.post("/", protect, createComment);

// protected route to update a comment by its ID
router.put("/:id", protect, updateComment);

// protected route to delete a comment by its ID
router.delete("/:id", protect, deleteComment);

//like a comment
router.post("/:id/like", protect, toggleLike);
//dislike a comment
router.post("/:id/dislike", protect, toggleDislike);  

export default router;