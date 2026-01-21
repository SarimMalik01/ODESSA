import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    scanId:{
      type:String,
      required:true,
      index:true,
      unique:true
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
    seen:{
      type:Boolean,
      default:false
    },
    status: {
      type: String,
      enum: [
       
        "ENQUEUEING",
        "CLONING",
        "CONFIGURING",
        "SCANNING",
        "ANALYZING",
        "COMPLETED",
        "FAILED"
      ],
      default: "ENQUEUEING"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Project", ProjectSchema);
