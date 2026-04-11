import mongoose, {Schema} from "mongoose";

const viewSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Videos"
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "Users"
    }
}, { timestamps: true });

viewSchema.index(
    {video: 1, user: 1},
    {unique: true}
)

export const Views = mongoose.model("Views", viewSchema);