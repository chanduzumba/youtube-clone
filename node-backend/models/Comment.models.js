import mongoose from "mongoose";
//Comment schema
const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, "Comment is required"],
      trim: true,
      minlength: 1,
      maxlength: 1000,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
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

    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
//listing comments of a video
commentSchema.index({ video: 1 });
//listing comments of a user
commentSchema.index({ user: 1 });
//listing newly created comments
commentSchema.index({ createdAt: -1 });

//comment model
const Comment = mongoose.model("Comment", commentSchema);

export default Comment;