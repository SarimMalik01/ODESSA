
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";
import "./workers/scanWorker.js"
const PORT = process.env.PORT || 5000;

connectDB();
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});

