import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Likes } from "../models/likes.model.js";
import mongoose from "mongoose";

const allowedTypes = {
    videos:   "Videos",
    comments: "Comments",
    tweets:   "Tweets"
};

const toggleLike = AsyncHandler(async (req, res) => {

  const targetType = allowedTypes[req.params.targetType];
  const targetId   = req.params.targetId;
  const user = req.user;
  
  if (!targetType)                            throw new ApiError(400, "Invalid targetType");  
  if (!targetId)                              throw new ApiError(400, "targetId not found!");
  if (!user)                                  throw new ApiError(400, "Unauthorized");

  const like = await Likes.findOneAndDelete({
    likeBy: user._id,
    targetType: targetType,
    targetId: targetId,
  });

  if (like) {
    return res.status(200).json(new ApiResponse(200, "unlike successfully", like));
  }

  const result = await Likes.create({
    likeBy: user._id,
    targetType: targetType,
    targetId: targetId
  })

  return res.status(200).json(new ApiResponse(200, "like successfully", result));
});

const getLike = AsyncHandler(async (req, res) => {
  const targetType = allowedTypes[req.params.targetType];
  const targetId = req.params.targetId;
  const user = req.user;

  if (!targetType) throw new ApiError(400, "Invalid targetType!");
  if (!targetId) throw new ApiError(400, "targetId not found!");
  if (!user) throw new ApiError(401, "Unauthorized!");

  const targetObjectId = new mongoose.Types.ObjectId(targetId);

  const [likeCount, isLiked, likes] = await Promise.all([
    Likes.countDocuments({
      targetType,
      targetId: targetObjectId,
    }),

    Likes.exists({
      targetType,
      targetId: targetObjectId,
      likeBy: user._id,
    }),

    Likes.aggregate([
      {
        $match: {
          targetType,
          targetId: targetObjectId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "likeBy",
          foreignField: "_id",
          as: "user",
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
          username: { $arrayElemAt: ["$user.username", 0] },
          profileimage: { $arrayElemAt: ["$user.profileimage", 0] },
        },
      },
      {
        $project: {
          username: 1,
          profileimage: 1,
          createdAt: 1,
        },
      },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Likes fetched successfully", {
      likeCount,
      isLiked: Boolean(isLiked),
      likes,
    })
  );
});

const getLikedVideos = AsyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized!");
  }

  const likedVideos = await Likes.aggregate([
    {
      $match: {
        likeBy: userId,
        targetType: "Videos",
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "targetId",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $match: {
              isPublised: true,
            },
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
          {
            $project: {
              title: 1,
              slug: 1,
              videoId: 1,
              thumbnail: 1,
              views: 1,
              duration: 1,
              createdAt: 1,
              owner: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $replaceRoot: {
        newRoot: "$video",
      },
    },
  ]);
//   console.log(likedVideos);
   
  return res.status(200).json(
    new ApiResponse(200, "Liked videos fetched successfully", {
      videos: likedVideos,
      totalVideos: likedVideos.length,
    })
  );
});

export {toggleLike, getLike, getLikedVideos};