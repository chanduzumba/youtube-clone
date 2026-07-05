import Comment from "../models/Comment.models.js";
import Video from "../models/Video.models.js";

/**
 * Create Comment
 * POST /api/comments
 * Private
 */
export const createComment = async (req, res) => {
  try {
    // read comment data from request body
    const { text, video } = req.body;

    // verify that the video exists
    const existingVideo = await Video.findById(video);

    if (!existingVideo) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    // create and save new comment
    const comment = await Comment.create({
      text,
      video,
      user: req.user._id,
    });

    // return created comment
    res.status(201).json({
      success: true,
      message: "Comment added successfully.",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Comments By Video
 * GET /api/comments/video/:videoId
 * Public
 */
export const getCommentsByVideo = async (req, res) => {
  try {
    // fetch all comments for the video, sorted by latest first
    const comments = await Comment.find({
      video: req.params.videoId,
    })
      .populate("user", "username avatar")
      .sort({ createdAt: -1 });

    // return comments list
    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Comment By Id
 * GET /api/comments/:id
 * Public
 */
export const getCommentById = async (req, res) => {
  try {
    // fetch comment by ID and populate user details
    const comment = await Comment.findById(req.params.id).populate(
      "user",
      "username avatar"
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // return comment details
    res.status(200).json({
      success: true,
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Update Comment
 * PUT /api/comments/:id
 * Private
 */
export const updateComment = async (req, res) => {
  try {
    // fetch comment by ID
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // verify that the logged-in user is the comment owner
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this comment.",
      });
    }

    // update comment text if provided
    const { text } = req.body;

    if (text) {
      comment.text = text;
      comment.isEdited = true;
    }

    // save updated comment
    await comment.save();

    // return updated comment
    res.status(200).json({
      success: true,
      message: "Comment updated successfully.",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Delete Comment
 * DELETE /api/comments/:id
 * Private
 */
export const deleteComment = async (req, res) => {
  try {
    // fetch comment by ID
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // verify that the logged-in user is the comment owner
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment.",
      });
    }

    // delete the comment
    await comment.deleteOne();

    // return success message
    res.status(200).json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};