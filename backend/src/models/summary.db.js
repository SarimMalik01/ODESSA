import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    workspacePath: {
      type: String,
      required: false
    },

    fileTree: Object,

    normalizedIssues: Array,

    gemini: {
      status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "PENDING"
      },
      response: Object
    },

    status:{
      type:String,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
