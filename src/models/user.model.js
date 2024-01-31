import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowerCase: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
      index: true,
    },
    lastName: {
      type: String,
      required: true,
      index: true,
    },
    avatar: {
      type: String, // Cloudinary
    },
    coverImage: {
      type: String, // Cloudinary
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Videos",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// We will encrypt password in this function
// There are some hooks in mongoose help to perform operation (pre = "before save" )
userSchema.pre("save", async function (next) {
  // There is a prblem if we make this function that bcrypt change password everytime when we will change any thing. That's why we will do it in condtion (if/else)
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Now we have to check password for login. So, bcrypt provide the facility to perform this task
userSchema.methods.isPasswordCorrect = async function (enterPassword) {
  // It takes the password and compare it with the database password
  return await bcrypt.compare(enterPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return Jwt.sign(
    {
      _id: this._id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: 3600,
    }
  );
};
userSchema.methods.generateRefreshToken = function () {
  return Jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: 3600,
    }
  );
};
export const User = mongoose.model("User", userSchema);
