import mongoose, { Schema } from "mongoose";
import { nanoid } from "nanoid";

const videoSchema = new Schema(
  {
    videofile: {
      type: String,
      required: true,
    },
    videofileId: {
      type: String,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    thumbnailId: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: String,
      required: true,
    },
    videoId: {
      // Clean public ID
      type: String,
      unique: true,
      index: true,
    },
    slug: {
      // SEO slug
      type: String,
      unique: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublised: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  {
    timestamps: true,
  }
);

videoSchema.pre("save", async function (next) {
  if (!this.videoId) this.videoId = `vid_${nanoid(8)}`;

  if (this.isModified("title")) {
    const baseSlug = slugify(this.title, {
      lower: true,
      strict: true,
    });

    const existing = mongoose.model.Videos.findOne({
      slug: baseSlug,
    });

    this.slug = existing ? `${baseSlug}-${nanoid(4)}` : baseSlug;
  }
  next();
});

export const Videos = mongoose.model("Videos", videoSchema);
