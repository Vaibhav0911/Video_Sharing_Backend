import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import mongoose from "mongoose";

export const createPlaylist = AsyncHandler(async (req, res) => {
  const { name, description, isPrivate } = req.body;

  if (!name) {
    throw new ApiError(400, "Playlist name is required");
  }

  const existing = await Playlist.findOne({
    owner: req.user._id,
    name,
  });

  if (existing) {
    throw new ApiError(400, "Playlist with same name already exists");
  }

  const playlist = await Playlist.create({
    name,
    description,
    isPrivate,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", playlist));
});

export const getUserPlaylists = AsyncHandler(async (req, res) => {
  const { userId } = req.params;

  const playlists = await Playlist.find({
    owner: userId,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlists fetched successfully", playlists));
});

export const getPlaylistById = AsyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playlistId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    profileimage: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $arrayElemAt: ["$owner", 0] },
            },
          },
        ],
      },
    },
  ]);

  if (!playlist.length) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist fetched successfully", playlist[0]));
});

export const updatePlaylist = AsyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description, isPrivate } = req.body;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  if (name) playlist.name = name;
  if (description !== undefined) playlist.description = description;
  if (isPrivate !== undefined) playlist.isPrivate = isPrivate;

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist updated successfully", playlist));
});

export const deletePlaylist = AsyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  await playlist.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist deleted successfully", {}));
});

export const addVideoToPlaylist = AsyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  const alreadyExists = playlist.videos.some(
    (id) => id.toString() === videoId
  );

  if (alreadyExists) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Video added to playlist", playlist));
});

export const removeVideoFromPlaylist = AsyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Unauthorized");
  }

  playlist.videos = playlist.videos.filter(
    (id) => id.toString() !== videoId
  );

  await playlist.save();

  const updatedPlaylist = await Playlist.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(playlistId) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    profileimage: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: { $arrayElemAt: ["$owner", 0] },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Video removed from playlist",
        updatedPlaylist[0]
      )
    );
});