import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
      required: true,
      index: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Videos",
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

playlistSchema.index({ owner: 1, name: 1 }, { unique: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);