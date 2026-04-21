import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import Auth from "./routes/auth.route.js"
import User from "./routes/user.route.js";
import Video from "./routes/video.route.js";
import Subscription from "./routes/subscription.route.js";
import Comment from "./routes/comment.route.js";
import Like from "./routes/like.route.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))

app.use("/api/v1/auth", Auth);
app.use("/api/v1/users", User);
app.use("/api/v1/videos", Video);
app.use("/api/v1/subscriptions", Subscription);
app.use("/api/v1/comments", Comment);
app.use("/api/v1/likes", Like);


export {app};