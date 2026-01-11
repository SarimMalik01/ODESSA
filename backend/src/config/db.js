import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed");
    console.error(err.message);
    process.exit(1);
  }
};
