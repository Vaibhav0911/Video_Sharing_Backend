import mongoose, {Schema} from "mongoose";

const commentSchema = new Schema(
    {
       video: {
        type: Schema.Types.ObjectId,
        ref: "Videos",
       },
       content: {
        type: String,
        default: ""
       },
       owner: {
        type: Schema.Types.ObjectId,
        ref: "Users",
       }
    }, {timestamps: true}
);

commentSchema.index({
    video: 1
})

export const Comments = mongoose.model("Comments", commentSchema);