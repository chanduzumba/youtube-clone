import Video from "../models/Video.models.js";
import Channel from "../models/Channel.models.js";

/**
 * Create Video
 * POST /api/videos
 * Private
 */
export const createVideo = async (req, res) => {
  try {
    // read video data from request body
    const {
      title,
      description,
      thumbnailUrl,
      videoUrl,
      category,
      duration,
      visibility,
    } = req.body;

    // find the logged-in user's channel
    const channel = await Channel.findOne({
      owner: req.user._id,
    });

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Create a channel before uploading videos.",
      });
    }

    // create and save new video
    const video = await Video.create({
      title,
      description,
      thumbnailUrl,
      videoUrl,
      category,
      duration,
      visibility,
      uploader: req.user._id,
      channel: channel._id,
    });

    // return created video
    res.status(201).json({
      success: true,
      message: "Video uploaded successfully.",
      video,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get All Videos
 * GET /api/videos
 * Public
 */
export const getAllVideos = async (req, res) => {
  try {
    // read optional query filters
    const { search, category } = req.query;

    const filter = {};

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    // fetch videos with optional filters and populate relations
    const videos = await Video.find(filter)
      .populate("uploader", "username avatar")
      .populate("channel", "channelName logo")
      .sort({ createdAt: -1 });

    // return video list
    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    //return error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Video By Id
 * GET /api/videos/:id
 * Public
 */
export const getVideoById = async (req, res) => {
  try {
    // find video by id and populate related details
    const video = await Video.findById(req.params.id)
      .populate("uploader", "username avatar")
      .populate("channel", "channelName logo");

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // increment view count and save
    video.views += 1;
    await video.save();

    // return video details
    res.status(200).json({
      success: true,
      video,
    });
  } catch (error) {
    //return error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Logged-in User Videos
 * GET /api/videos/my
 * Private
 */
export const getMyVideos = async (req, res) => {
  try {
    // fetch videos uploaded by the logged-in user
    const videos = await Video.find({
      uploader: req.user._id,
    }).sort({ createdAt: -1 });

    // return matched videos
    res.status(200).json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error) {
    //return error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Video
 * PUT /api/videos/:id
 * Private
 */
export const updateVideo = async (req, res) => {
  try {
    // find video by id
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // ensure user owns the video
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this video.",
      });
    }

    // read update fields from request body
    const {
      title,
      description,
      thumbnailUrl,
      videoUrl,
      category,
      duration,
      visibility,
    } = req.body;

    // apply updates if provided
    if (title) video.title = title;
    if (description) video.description = description;
    if (thumbnailUrl) video.thumbnailUrl = thumbnailUrl;
    if (videoUrl) video.videoUrl = videoUrl;
    if (category) video.category = category;
    if (duration) video.duration = duration;
    if (visibility) video.visibility = visibility;

    // save updated video
    await video.save();

    // return updated video
    res.status(200).json({
      success: true,
      message: "Video updated successfully.",
      video,
    });
  } catch (error) {
    //return error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Video
 * DELETE /api/videos/:id
 * Private
 */
export const deleteVideo = async (req, res) => {
  try {
    // find video by id
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // ensure the logged-in user owns the video
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this video.",
      });
    }

    // delete the video document
    await video.deleteOne();

    // return deletion success
    res.status(200).json({
      success: true,
      message: "Video deleted successfully.",
    });
  } catch (error) {
    //return error message
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Toggle Like
 * PATCH /api/videos/:id/like
 * Private
 */
export const toggleLike = async (req, res) => {
  try {
    // fetch video by ID
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    const userId = req.user._id.toString();

    // check if user has already liked the video
    const liked = video.likedBy.some(
      (id) => id.toString() === userId
    );

    // check if user has already disliked the video
    const disliked = video.dislikedBy.some(
      (id) => id.toString() === userId
    );

    if (liked) {
      // remove like if already liked
      video.likedBy = video.likedBy.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // add like
      video.likedBy.push(userId);

      // remove dislike if user previously disliked
      if (disliked) {
        video.dislikedBy = video.dislikedBy.filter(
          (id) => id.toString() !== userId
        );
      }
    }

    // save updated video
    await video.save();

    // return updated like and dislike counts
    res.status(200).json({
      success: true,
      likes: video.likedBy.length,
      dislikes: video.dislikedBy.length,
      liked: !liked,
      disliked: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Toggle Dislike
 * PATCH /api/videos/:id/dislike
 * Private
 */
export const toggleDislike = async (req, res) => {
  try {
    // fetch video by ID
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    const userId = req.user._id.toString();

    // check if user has already liked the video
    const liked = video.likedBy.some(
      (id) => id.toString() === userId
    );

    // check if user has already disliked the video
    const disliked = video.dislikedBy.some(
      (id) => id.toString() === userId
    );

    if (disliked) {
      // remove dislike if already disliked
      video.dislikedBy = video.dislikedBy.filter(
        (id) => id.toString() !== userId
      );
    } else {
      // add dislike
      video.dislikedBy.push(userId);

      // remove like if user previously liked
      if (liked) {
        video.likedBy = video.likedBy.filter(
          (id) => id.toString() !== userId
        );
      }
    }

    // save updated video
    await video.save();

    // return updated like and dislike counts
    res.status(200).json({
      success: true,
      likes: video.likedBy.length,
      dislikes: video.dislikedBy.length,
      liked: false,
      disliked: !disliked,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};