import mongoose from "mongoose";

//Video schema
const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      minlength: 3,
      maxlength: 100,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: 5000,
      trim: true,
    },

    thumbnailUrl: {
      type: String,
      required: [true, "Thumbnail URL is required"],
    },

    videoUrl: {
      type: String,
      required: [true, "Video URL is required"],
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Music",
        "Gaming",
        "Education",
        "Sports",
        "Technology",
        "News",
        "Entertainment",
        "Movies",
        "Comedy",
        "Lifestyle",
      ],
    },

    duration: {
      type: Number, // seconds
      required: true,
      min: 1,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    likes: {
      type: Number,
      default: 0,
      min: 0,
    },

    dislikes: {
      type: Number,
      default: 0,
      min: 0,
    },

    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    dislikedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private", "unlisted"],
      default: "public",
    },

    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

//Adding indexes for faster searching and filtering:
// Searching videos by title/description
videoSchema.index({ title: "text", description: "text" });
//Filtering by category
videoSchema.index({ category: 1 });
// Listing a user's uploaded videos
videoSchema.index({ uploader: 1 });
// Listing a channel's videos
videoSchema.index({ channel: 1 });
// Showing newest uploads first
videoSchema.index({ createdAt: -1 });

//Video model
const Video = mongoose.model("Video", videoSchema);

export default Video;
