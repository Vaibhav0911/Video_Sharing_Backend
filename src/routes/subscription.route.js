import { Router } from "express";
import { jwtverify } from "../middlewares/auth.middleware.js";
import {
  toggleSubscribeChannel
} from "../controllers/subscription.controller.js";

const router = Router();

router.route("/users/:username").post(
    jwtverify,
    toggleSubscribeChannel
)

export default router;