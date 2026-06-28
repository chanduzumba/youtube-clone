import jwt from "jsonwebtoken";
import User from "../models/User.models.js";

//auth middleware to check auth token in header request and append user to req object
const protect = async (req, res, next) => {
  try {
    //read authorizaiton header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        //Unauthorized
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    //get token from header
    const token = authHeader.split(" ")[1];
    //decode using jwt verify and secret from env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //find user with decoded id
    const user = await User.findById(decoded.id);

    if (!user) {
        //User not found
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    //attach user to req object
    req.user = user;
    //next() to return response
    next();
  } catch (error) {
    //return error message
    res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

export default protect;