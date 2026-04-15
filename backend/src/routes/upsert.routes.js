import express from "express";
import { upsertIssuesToRAG } from "../../rag/upsert/upsertIssuestoRag.js";
import { MongoClient } from "mongodb";

const router = express.Router();

const client = new MongoClient(process.env.MONGO_URI);

/**
 * POST /odessa/upsert
 */
router.post("/", async (req, res) => {
  console.log("📥 /odessa/upsert HIT");

  try {
    const { issues, gemini, scanId, repoId } = req.body;

    console.log("📦 Payload received:", {
      issues: issues?.length,
      scanId,
    });

    await client.connect();
    const db = client.db();

    /* =========================
       🔍 FETCH PROJECT NAME
    ========================= */
    const projectDoc = await db.collection("projects").findOne({
      scanId,
    });

    if (!projectDoc) {
      console.warn("⚠️ Project not found, using fallback");
    }

    const projectName = projectDoc?.name || "unknown";

    /* =========================
       🚀 UPSERT TO RAG
    ========================= */
    await upsertIssuesToRAG({
      issues,
      gemini,
      scanId,
      repoId,
      projectName, // ✅ CORRECT VALUE
    });

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Upsert route failed:", err);
    res.status(500).json({ error: "Upsert failed" });
  }
});

export default router;