import { Router } from "express";
import { Upload } from "../middlewares/upload.middleware.js";
import { userRegister } from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(
  Upload.fields([
    { name: "profileimage", maxCount: 1 },
    { name: "coverimage", maxCount: 2 },
  ]),
  userRegister
);

export default router;
