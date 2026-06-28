import jwt from "jsonwebtoken";

//generate token using jwt sign method
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, //payload
    process.env.JWT_SECRET, //secret
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d", //expiry
    }
  );
};

export default generateToken;