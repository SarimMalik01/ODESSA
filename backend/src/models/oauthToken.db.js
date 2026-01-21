import mongoose from "mongoose";

const OAuthTokenSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    enum: ["github"],
    required: true
  },
  encryptedToken: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("OAuthToken", OAuthTokenSchema);
