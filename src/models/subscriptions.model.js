import { Schema } from "mongoose";
import { Users } from "./users.model.js";

const Subscriptions = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: Users,
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: Users,
    },
  },
  { timestamps: true }
);

export { Subscriptions };
