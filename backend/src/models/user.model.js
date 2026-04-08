import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "email id is required"],
            unique: [true, "email id should be unique"]
        },
        username: {
            type: String,
            required: [true, "username is required"],
            unique: [true, "username should be unique"]
        },
        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local"
        },
        password: {
            type: String,
            required: function() {
                return this.provider === "local"
            },
            select: false
        },
        verified: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: true
    },
)

const userModel = mongoose.model("User", userSchema)

export default userModel