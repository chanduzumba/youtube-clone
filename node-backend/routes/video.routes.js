import express from "express";
import protect from "../middlewares/auth.middleware.js";

import {
  createVideo,
  getAllVideos,
  getMyVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
} from "../controllers/video.controller.js";

const router = express.Router();

// route to get all videos
router.get("/", getAllVideos);

// protected route to get logged-in user's videos
router.get("/my/videos", protect, getMyVideos);

// protected route to upload a new video
router.post("/", protect, createVideo);

// route to get a video by its ID
router.get("/:id", getVideoById);

// protected route to update a video by its ID
router.put("/:id", protect, updateVideo);

// protected route to delete a video by its ID
router.delete("/:id", protect, deleteVideo);

export default router;