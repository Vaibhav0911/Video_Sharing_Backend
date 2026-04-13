import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Users",
    },
  },
  { timestamps: true }
);

subscriptionSchema.index({
  subscriber: 1,
  channel: 1,
}, {unique: true})

export const Subscriptions = mongoose.model("Subscriptions", subscriptionSchema);
