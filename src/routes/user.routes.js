import { Router } from "express";
import {
  changePassword,
  changeProfileImage,
  changeProfileInfo,
  getChannelsDetails,
  getUser,
  logOutUser,
  loginUser,
  refreshAccessToken,
  updateCoverImage,
  userRegister,
  watchHistory,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Here we are going to do settings to take and sav image through multer

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  userRegister
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logOutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changePassword);

router.route("/change-profile-info").post(verifyJWT, changeProfileInfo);

router
  .route("/change-profile-image")
  .patch(verifyJWT, upload.single("avatar"), changeProfileImage);

router
  .route("/change-profile-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/user-info").patch(verifyJWT, getUser);

router.route("/c/:username").get(verifyJWT, getChannelsDetails);

router.route("/watch-history").get(verifyJWT, watchHistory);

export default router;
