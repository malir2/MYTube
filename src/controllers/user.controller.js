import asyncHandler from "../utils/asyncHandler.js";

const userRegister = asyncHandler((req, res) => {
  res.json({ message: "Hello" });
});

export default userRegister;
