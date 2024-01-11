import { Router } from "express";
import { userRegister } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Here we are going to do settings to take and sav image through multer

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  userRegister
);

export default router;
