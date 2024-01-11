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

// Now we will make user login controller

// Features and points:

// username or email from user
// Check email or username exist
// Match password
// Generate access token and refresh token
// Make secure cookies

const loginUser = asyncHandler(async (req, res) => {
  // First we will take username , email and password from body
  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new apiError(404, "Email or username is required!");
  }

  // Now, we will check for username and email
  const checkUser = User.findOne({
    $or: [{ username }, { email }],
  });

  // If username or email does not match then we will throw error
  if (!checkUser) {
    throw new apiError(404, "User doesn't exist!");
  }

  // Now we will check for password for that we will use bcrypt "isPasswordCorrect" method which we made in user model

  const checkPassword = await checkUser.isPasswordCorrect(password);

  // If password is not correct then we will throw an error
  if (!checkPassword) {
    throw new apiError(404, "Incorrect password!");
  }

  // If everything is correct so now we have to generate access token and refresh token. To use them, We will make a method to make our task easier

  // We need user id to generate token
  const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
      // First we will find the user by its id
      const user = await User.findById(userId);

      const accessToken = userId.generateAccessToken();
      const refreshToken = userId.generateRefreshToken();

      // To save refreshToken we will asign it to the user
      user.refeshToken = refreshToken;

      // Now we will save the user. Here, I write "validityBeforeSave: false" so, it don't make any change during save
      user.save({ validityBeforeSave: false });
      return { accessToken, refreshToken };
    } catch (error) {
      throw new apiError(500, "Something went wrong!");
    }
  };
  // Now we are ready to generate accessToken and refreshToken
  // Here we distructure the function
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(checkUser._id);

  // To remove user password and refreshToken we will do this
  const loggedInUser = await User.findById(checkUser._id).select(
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
  await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined,
    },
  });

  const option = {
    httpOnly: true,
    secure: true,
  };

  res.status(200).cookie("accessToken", option).cookie("refreshToken", option);
});

export { userRegister, loginUser, logOutUser };
