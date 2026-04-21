import { Router } from "express";
import { jwtverify } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, editComment, getAllComment } from "../controllers/comment.controller.js";

const router = Router();

router.route("/videos/:videoId").post(
    jwtverify,
    addComment
)

router.route("/videos/:videoId").get(
    jwtverify,
    getAllComment
)

router.route("/:commentId").delete(
    jwtverify,
    deleteComment
)

router.route("/:commentId").patch(
    jwtverify,
    editComment
)

export default router;