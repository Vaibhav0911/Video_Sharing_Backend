import { Router } from "express";
import { jwtverify } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(jwtverify);

router.route("/").post(createPlaylist);
router.route("/user/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById).patch(updatePlaylist).delete(deletePlaylist);
router.route("/:playlistId/videos/:videoId").patch(addVideoToPlaylist).delete(removeVideoFromPlaylist);

export default router;