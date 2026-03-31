import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: String,
      required: true,
    },

    originalPrice: {
      type: Number,
      required: true,
    },

    finalPrice: {
      type: Number,
      required: true,
    },

    score: {
      type: Number, 
      required: true,
    },

    attempts: {
        type: Number
    },

    aiMoode: {
        type: String
    }
  },
  {
    timestamps: true,
  }
);

scoreSchema.index({ score: -1 });

const scoreModel = mongoose.model("Score", scoreSchema);

export default scoreModel;