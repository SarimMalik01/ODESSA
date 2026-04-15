import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
      role: {
        type: String,
        enum: ["user", "bot"],
        required: true,
      },
      content: {
        type: mongoose.Schema.Types.Mixed,
        required: false,
      },
  
      citations: {
        type: Array,
        required: false,
      },
      state: {
        type: String,
        enum: ["idle", "thinking", "synthesizing", "finalizing","completed"],
        default: "idle",
      },
      llmUsage: {
        tokens: Number,
        cost: Number,
      },
  
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
    { _id: true }
  );


const chatSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
   

    projectName: {
      type: String,
      required: true,
      index: true,
    },

    messages: [messageSchema],
  },
  { timestamps: true }
);

export const ChatModel = mongoose.model("Chat", chatSchema);