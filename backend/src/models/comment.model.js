import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    author: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    tag: {
      type: String,
      enum: ["important", "necessary", "deadline", "keep_in_mind"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export default mongoose.model("Comment", CommentSchema);
