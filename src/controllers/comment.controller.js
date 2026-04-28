import { Comments } from "../models/comments.model.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Videos } from "../models/videos.model.js";
import mongoose from "mongoose";

const addComment = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId) throw new ApiError(400, "videoId not found!");

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const video = await Videos.findById(videoId).select("_id");

  if (!video) throw new ApiError(404, "Video not found!");

  const comment = await Comments.create({
    video: video._id,
    owner: req.user._id,
    content: content.trim(),
  });

  const populatedComment = await Comments.findById(comment._id)
    .populate("owner", "username profileimage")
    .select("owner content createdAt updatedAt");

  return res.status(201).json(
    new ApiResponse(
      201,
      "Comment created successfully",
      populatedComment
    )
  );
});

const getAllComment = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "videoId not found!");

  const video = await Videos.findById(videoId);

  if (!video) throw new ApiError(400, "video not found!");

  const comment = await Comments.aggregate([
    {
      $match: { video: video._id },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              profileimage: 1,
              username: 1,
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
    {
      $project: {
        owner: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (comment.length === 0) {
    res
      .status(200)
      .json(new ApiResponse(200, "Fetch comments successfully", comment));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Fetch comment successfully", comment));
});

const deleteComment = AsyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) throw new ApiError(400, "commentId not found!");

  const isComment = await Comments.findByIdAndDelete(commentId);

  if (!isComment) throw new ApiError(400, "comment not found!");

  res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted successfully", { commentId }));
});

const editComment = AsyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!commentId) {
    throw new ApiError(400, "commentId not found!");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const existingComment = await Comments.findById(commentId);

  if (!existingComment) {
    throw new ApiError(404, "Comment not found!");
  }

  if (existingComment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to edit this comment");
  }

  const updatedComment = await Comments.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content.trim(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("owner", "username profileimage")
    .select("owner content createdAt updatedAt");

  return res.status(200).json(
    new ApiResponse(
      200,
      "Comment updated successfully",
      updatedComment
    )
  );
});

export { addComment, deleteComment, editComment, getAllComment };
