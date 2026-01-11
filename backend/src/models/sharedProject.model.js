import mongoose from "mongoose";

const SharedProjectSchema = new mongoose.Schema(
  {
    // 🔗 Project being shared
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    // 👤 Owner of the project
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
      

    // 🔐 Token embedded in share link
    sharedToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // ⏰ Expiry of the share link
    expiresAt: {
      type: Date,
      required: true,
    },

    // 👥 Allowed recipients (optional)
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
      
    
    // 🔄 Status for manual revoke / expiry handling
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

// 🔥 Auto-expire documents at DB level
SharedProjectSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.model("SharedProject", SharedProjectSchema);
