import bcrypt from "bcryptjs";
import validator from "validator"
import User from "../models/User.models.js";
import generateToken from "../utils/generateToken.js";


// REGISTER controller
export const registerController = async (req, res) => {
  try {
    //get user data from req body
    const { username, email, password } = req.body;

    // Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "username, email and password are required",
      });
    }

    // password validation
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain uppercase, lowercase, number and special character",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    //if found return already existing user
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or Username already exists",
      });
    }

    // Create user; password will be hashed by the model hook
    const user = await User.create({
      username,
      email,
      password,
    });

    //return success message
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    //return error message
    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// LOGIN Controller
export const loginController = async (req, res) => {

  try {
    //read data from req body
    const { email, password } = req.body;

    //check if data is missing
    if (!email || !password) {

      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });

    }

    // Need password because select:false
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
    //return invalid email message
      return res.status(401).json({
        success: false,
        message: "Invalid email",
      });

    }

     // schema method: to check encrypted password
    const isMatch = await user.comparePassword(password);

    //invalid password error message
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    //generate jwt token
    const token = generateToken(user._id);

    //return success msg along with token and loggedin user details
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });

  } catch (error) {
    //return error message
    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

//get profile controller
export const getProfileController = async (req, res) => {

  try {
    //return user is authorized
    res.status(200).json({
      success: true,
      user: req.user,
    });

  } catch (error) {
    //return error message
    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};