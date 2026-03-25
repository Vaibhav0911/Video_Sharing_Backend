import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
}

export {connectDB};