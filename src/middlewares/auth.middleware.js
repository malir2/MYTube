import jwt from "jsonwebtoken";
import apiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// Here we will use next because it is middleware and after completion of the desire task. It will pass the controll to the next
const authentication = asyncHandler(async (req, res, next) => {
  try {
    // First we will get token it may be come from cookies or header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new apiError(401, "Unauthorized request");
    }

    // Now we wil decide the token for this we will verify function of jwt which take token and access token
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Now we after decode we will find the user by it id. The id can be used because we send it to the token in our "user.model.js".
    const user = User.findById(decode?._id).select("-password -refreshToken");

    if (!user) {
      throw new apiError(404, "There is no access token!");
    }

    req.user = user;
  } catch (error) {
    throw new apiError(404, "Something went wrong!");
  }
});

export default authentication;
