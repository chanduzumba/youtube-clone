import { Router } from "express";
import { createChannel, getAllChannels, getChannelById, getMyChannel, updateChannel, deleteChannel } from "../controllers/channel.controller.js";
import protect from "../middlewares/auth.middleware.js";

//create a router instance to define routes for channel-related functionality
const router = Router();

//route to create a new channel for logged-in user
router.post('/', protect, createChannel);
//route to get all channels
router.get('/', getAllChannels);
//protected route to get user channel by user ID
router.get('/me', protect, getMyChannel);
//route to get a channel by its ID
router.get('/:id', getChannelById);
//protected route to update a channel by its ID
router.put('/:id', protect, updateChannel);
//protected route to delete a channel by its ID
router.delete('/:id', protect, deleteChannel);

export default router;