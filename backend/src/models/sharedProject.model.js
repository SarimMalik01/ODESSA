import mongoose from "mongoose";

const SharedProjectSchema = new mongoose.Schema(
  {
    
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

   
    owner: {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
          index: true,
        },
        email: {
          type: String,
          required: true,
        },
      },
      

    sharedToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

  
    expiresAt: {
      type: Date,
      required: true,
    },

    
    recipients: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          email: {
            type: String,
            required: true,
          },
          accessedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      
    
  
    status: {
      type: String,
      enum: ["active", "expired", "revoked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

SharedProjectSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("SharedProject", SharedProjectSchema);
