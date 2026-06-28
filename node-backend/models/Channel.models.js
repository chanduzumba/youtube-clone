import mongoose from "mongoose";

//Channel schema
const channelSchema = new mongoose.Schema(
  {
    channelName: {
      type: String,
      required: [true, "Channel name is required"],
      trim: true,
      minlength: 3,
      maxlength: 50,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    logo: {
      type: String,
      default:
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },

    banner: {
      type: String,
      default:
        "https://via.placeholder.com/1200x300?text=Channel+Banner",
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    subscribersCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalViews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
//filtering channel by channelName
channelSchema.index({ channelName: "text" });
//listing channels of a user
channelSchema.index({ owner: 1 });

//Channel model
const Channel = mongoose.model("Channel", channelSchema);

export default Channel;