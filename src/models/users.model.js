import bcrypt from "bcrypt";
import { Schema } from "mongoose";
import { Videos } from "./videos.model.js";
import jwt from "jsonwebtoken";

const Users = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    coverimage: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    refreshtoken: {
      type: String,
    },
    watchHistory: {
      type: Schema.Types.ObjectId,
      ref: Videos,
    },
  },
  {
    timestamps: true,
  }
);

Users.pre("save", async function () {
  if (!this.isModified("password"))   return;

  this.password = await bcrypt.hash(this.password, 10);
});

Users.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(this.password, password);
};

Users.methods.accessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

Users.methods.refreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export { Users };
