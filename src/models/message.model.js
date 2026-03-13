import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        chat:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: [true, "chatId is required"]
        },
        content:{
            type: String,
            required: [true, "message content is required"]
        },
        role:{
            type: String,
            enum: ["user", "ai"],
            default: "user"
        }
    },
    {
        timestamps: true
    }
)

const messageModel = mongoose.model("Message", messageSchema)

export default messageModel