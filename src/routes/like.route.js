import { Router } from "express";
import { jwtverify } from "../middlewares/auth.middleware.js";
import { toggleLike, getLike, getLikedVideos } from "../controllers/like.controller.js";

const router = Router();

router.route("/:targetType/:targetId").post(
    jwtverify,
    toggleLike
)

router.route("/:targetType/:targetId").get(
    jwtverify,
    getLike
)

router.route("/videos").get(
    jwtverify,
    getLikedVideos
)

export default router;