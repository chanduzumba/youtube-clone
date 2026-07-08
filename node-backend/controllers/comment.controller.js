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

/**
 * Toggle Like
 * PATCH /api/comments/:id/like
 * Private
 */
export const toggleLike = async (req, res) => {
  try {
    // fetch comment by ID
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    const userId = req.user._id.toString();

    // check if user has already liked the comment
    const liked = comment.likedBy.some(
      (id) => id.toString() === userId
    );

    // check if user has already disliked the comment
    const disliked = comment.dislikedBy.some(
      (id) => id.toString() === userId
    );

    if (liked) {
      // remove like if already liked
      comment.likedBy = comment.likedBy.filter(
        (id) => id.toString() !== userId
      );
      comment.likes = Math.max(comment.likes - 1, 0);
    } else {
      // add like
      comment.likedBy.push(userId);
      comment.likes += 1;
      // remove dislike if user previously disliked
      if (disliked) {
        comment.dislikedBy = comment.dislikedBy.filter(
          (id) => id.toString() !== userId
        );
        comment.dislikes = Math.max(comment.dislikes - 1, 0);
      }
    }

    // save updated comment
    await comment.save();

    // return updated like and dislike counts
    res.status(200).json({
      success: true,
      likes: comment.likedBy.length,
      dislikes: comment.dislikedBy.length,
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
 * PATCH /api/comments/:id/dislike
 * Private
 */
export const toggleDislike = async (req, res) => {
  try {
    // fetch comment by ID
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Video not found.",
      });
    }

    const userId = req.user._id.toString();

    // check if user has already liked the comment
    const liked = comment.likedBy.some(
      (id) => id.toString() === userId
    );

    // check if user has already disliked the comment
    const disliked = comment.dislikedBy.some(
      (id) => id.toString() === userId
    );

    if (disliked) {
      // remove dislike if already disliked
      comment.dislikedBy = comment.dislikedBy.filter(
        (id) => id.toString() !== userId
      );
      comment.dislikes = Math.max(comment.dislikes - 1, 0);
    } else {
      // add dislike
      comment.dislikedBy.push(userId);
      comment.dislikes += 1;
      // remove like if user previously liked
      if (liked) {
        comment.likedBy = comment.likedBy.filter(
          (id) => id.toString() !== userId
        );
        comment.likes = Math.max(comment.likes - 1, 0);
      }
    }

    // save updated comment
    await comment.save();

    // return updated like and dislike counts
    res.status(200).json({
      success: true,
      likes: comment.likedBy.length,
      dislikes: comment.dislikedBy.length,
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