
import dotenv from "dotenv";
dotenv.config();
import { esClient } from "../rag/elastic/client.js";
import { ensureIndex } from "../rag/elastic/createIndex.js";
import app from "./app.js";
import cookieParser from "cookie-parser";

 
import { connectDB } from "./config/db.js";
import "./workers/scanWorker.js"
const PORT = process.env.PORT || 5000;

app.use(cookieParser());




async function waitForElastic() {
  const maxRetries = 40;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // 🔥 FIX: Remove { body } destructuring. v9 returns the response directly.
      const health = await esClient.cluster.health();

      if (health.status === "yellow" || health.status === "green") {
        console.log(`🟢 ES cluster ready: ${health.status}`);

        // Now safe to create index
        await ensureIndex();

        console.log("✅ Elasticsearch fully ready");
        return;
      }
    } catch (err) {
      // 🔥 FIX: Do not ignore errors silently. If the cluster is actually down, print the error!
      console.error(`⏳ Waiting for Elasticsearch... (${i + 1}/${maxRetries}) - Error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  throw new Error("❌ Elasticsearch failed to reach ready state");
}

connectDB();
await waitForElastic(); 
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";
app.listen(5000, "0.0.0.0", () => {
  console.log("🚀 Server running on port 5000");
});

