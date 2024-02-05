import apiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import apiResponse from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import Jwt, { decode } from "jsonwebtoken";

// We need user id to generate token
const generateAccessAndRefreshTokens = async function (userId) {
  try {
    // By user id we will find it
    const user = await User.findById(userId);

    if (!user) {
      throw new apiError(404, "User not found");
    }

    // now we will store access and refresh token in variables. We made a method for thi in user model
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // We will save refresh token by this method
    user.refreshToken = refreshToken;
    // Then we will save it
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error generating tokens:", error.message, error.stack);

    throw new apiError(
      500,
      "Something went wrong while generating refresh and access tokens"
    );
  }
};
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

// Now we will make user login controller

// Features and points:

// username or email from user
// Check email or username exist
// Match password
// Generate access token and refresh token
// Make secure cookies

const loginUser = asyncHandler(async (req, res) => {
  // First we will take username, email and password
  const { email, username, password } = req.body;
  console.log(email);

  // Username and email are optional one is required but if both are missing then this error will occurs
  if (!username && !email) {
    throw new apiError(400, "username or email is required");
  }

  // Now we will find user from database through email or username
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  // If username or email doesnot match then this error will occurs
  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  // Now, we will check password. We made a method in user model now we will use that method
  const isPasswordValid = await user.isPasswordCorrect(password);

  // If password is wrong then this method will be used
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  // If everything is correct so now we have to generate access token and refresh token. To use them, We will make a method to make our task easier which is on the top of the program

  // Now we are ready to generate accessToken and refreshToken
  // Here we distructure the function
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // To remove user password and refreshToken we will do this
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Use for cookie to add some features
  const option = {
    httpOnly: true,
    secure: true,
  };

  // All process is completed and we are ready to return response
  return (
    res
      .status(200)
      // To send cookie we use ".cookie"
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", refreshToken, option)
      .json(
        new apiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "You are logged in succcessfully!"
        )
      )
  );
});

const logOutUser = asyncHandler(async (req, res) => {
  // Here we will use findbyIdAndUpdate to find the user and update it directly
  // Now we can access the user because of middleware we use in user.routes
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    // We have to take refresh token first from cookies or body
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingToken) {
      throw new apiError(404, "Unauthorized Request!");
    }

    // After getting token we have to verify it
    const decodeToken = Jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodeToken) {
      throw new apiError(404, "Invalid Refresh Token");
    }

    // Now we have to find the user with this token
    const user = await User.findById(decodeToken._id);

    // Now we have to match incoming token with refresh token
    if (incomingToken !== user?.refreshToken) {
      throw new apiError(404, "Invalid Request!");
    }

    // Store the token in access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookies("accessToken", accessToken, options)
      .cookies("refreshToken", refreshToken, options)
      .json(new apiResponse({ accessToken, refreshToken }, 200));
  } catch (error) {
    console.log(error);
  }
});

export { userRegister, loginUser, logOutUser, refreshAccessToken };
