import Channel from "../models/Channel.models.js";
import Video from "../models/Video.models.js";

//Protected create channel controller
//use route POST /api/channel - Protected/Private API
export const createChannel = async (req, res) => {
  try {
    // read required data from request body
    const { channelName, description, logo, banner } = req.body;

    // Check if user already has a channel
    const existingChannel = await Channel.findOne({
      owner: req.user._id,
    });

    if (existingChannel) {
      return res.status(409).json({
        success: false,
        message: "You already have a channel.",
      });
    }

    //create a new channel for logged in user
    const channel = await Channel.create({
      channelName,
      description,
      logo,
      banner,
      owner: req.user._id,
    });
    //return success message
    res.status(201).json({
      success: true,
      message: "Channel created successfully.",
      channel,
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
 *   Get All Channels
 *   GET /api/channels
 *   Public
 */
export const getAllChannels = async (req, res) => {
  try {
    //fetch all channels and populate user data and sort as per newly added
    const channels = await Channel.find()
      .populate("owner", "username avatar")
      .sort({ createdAt: -1 });

      //return channels
    res.status(200).json({
      success: true,
      count: channels.length,
      channels,
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
 *  Get Single Channel Controller
 *  GET /api/channels/:id
 *  Public
 */
export const getChannelById = async (req, res) => {
  try {
    //get channel of user id provided in req param and populate user details
    const channel = await Channel.findById(req.params.id).populate(
      "owner",
      "username email avatar"
    );
    //if channel not found
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found.",
      });
    }
    // return channel if present
    res.status(200).json({
      success: true,
      channel,
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
 * Get Logged-in User Channel Controller
 * GET /api/channels/me
 * Private
 */
export const getMyChannel = async (req, res) => {
  try {
    //get channel by user id
    const channel = await Channel.findOne({
      owner: req.user._id,
    });

    //return not found message
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found.",
      });
    }
    //return channel details if data present
    res.status(200).json({
      success: true,
      channel,
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
Update Channel Controller
PUT /api/channels/:id
Private
*/
export const updateChannel = async (req, res) => {
  try {
    // find the channel by id from params
    const channel = await Channel.findById(req.params.id);

    // return 404 if not found
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found.",
      });
    }

    // ensure the logged-in user is the channel owner
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this channel.",
      });
    }

    // read update fields from request body
    const { channelName, description, logo, banner } = req.body;

    // update fields if provided
    if (channelName) channel.channelName = channelName;
    if (description) channel.description = description;
    if (logo) channel.logo = logo;
    if (banner) channel.banner = banner;

    // save changes to database
    await channel.save();

    // return updated channel
    res.status(200).json({
      success: true,
      message: "Channel updated successfully.",
      channel,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 *  Delete Channel
 *  DELETE /api/channels/:id
 *  Private
 */
export const deleteChannel = async (req, res) => {
  try {
    // find the channel by id
    const channel = await Channel.findById(req.params.id);

    // return 404 if channel does not exist
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: "Channel not found.",
      });
    }

    // ensure the requester is the owner
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this channel.",
      });
    }

    // delete all videos that belong to this channel
    await Video.deleteMany({
      channel: channel._id,
    });

    // remove the channel document
    await channel.deleteOne();

    // return success response
    res.status(200).json({
      success: true,
      message: "Channel deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};