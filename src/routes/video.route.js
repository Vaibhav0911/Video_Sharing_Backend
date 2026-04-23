import { Router } from "express";
import { jwtverify } from "../middlewares/auth.middleware.js";
import { optionalAuth } from "../middlewares/optionalAuth.middleware.js";
import { Upload } from "../middlewares/upload.middleware.js";
import { uploadVideo, getVideo, updateVideo, deleteVideo, getAllVideos } from "../controllers/video.controller.js";

const router = Router();

router.route("/").post(
  jwtverify,
  Upload.fields([
    { name: "videofile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadVideo
);

router.route("/:videoId/:slug").get(
  optionalAuth,
  getVideo
);

router.route("/").get(
  optionalAuth,
  getAllVideos
);

router.route("/:videoId").patch(
  Upload.single("thumbnail"),
  jwtverify,
  updateVideo
)

router.route("/:videoId").delete(
  jwtverify,
  deleteVideo
)

export default router;
