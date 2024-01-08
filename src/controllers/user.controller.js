import apiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import apiResponse from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const userRegister = asyncHandler(async (req, res) => {
  //   res.json({ message: "Hello" });
  // Now we are going to make a proper controller for user registration
  //  From here we are going we are going to start our controller
  //   Requirements:
  // 1. Take user details and validation not empty
  // 2. Check user existance
  // 3. Take images and upload on cloudinary
  // 4. Check for user creation
  // 5. Send details if created and remove password and encrypted token
  // 6. return response

  //   Taking user details
  const { username, email, password, firstName, lastName } = await req.body;

  // Now we will check that if all fields are filled or not
  if (
    [username, email, password, firstName, lastName].some((field) => {
      return field?.trim() === "";
    })
  ) {
    throw new apiError(404, "All fields are required!");
  }

  // Here we are checking for the existance of the user
  const userExsited = await User.findOne({
    //  In MongoDB, $or is a logical query operator that performs a logical OR operation on an array of two or more query expressions. It is commonly used in the find() method to retrieve documents that match any of the specified conditions.
    $or: [{ email }, { username }],
  });
  if (userExsited) {
    throw new apiError(400, "User already existed!");
  }

  const avatarLocalPath = await req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    console.log("error");
  }
  const coverImageLocalPath = await req.files?.coverImage[0]?.path;

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    console.log("error");
  }

  // Here we are creating user
  const user = await User.create({
    username,
    firstName,
    lastName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // Here we will find the user through mongodb id and use select method to not to select password and refreshToken
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createUser) {
    throw new apiError(500, "Something went wrong");
  }

  // Here we use apiResponse for successful registration.
  return res.json(
    new apiResponse(200, createUser, "User registered successfully.")
  );
});

export default userRegister;
