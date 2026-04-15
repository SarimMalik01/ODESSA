import { esClient } from "../elastic/client.js";
import crypto from "crypto";
import { generateEmbedding } from "../embedding/generateEmbedding.js";
import { computeImportanceScore } from "./computeImpScore.js";

const INDEX_NAME = "odessa-issues";
const BATCH_SIZE = 8;

export async function upsertIssuesToRAG({
  issues,
  gemini,
  scanId,
  repoId,
  projectName,
}) {
  if (!issues?.length) {
    console.warn("⚠️ No issues received");
    return;
  }

  console.log("🧾 Issues received:", issues.length);

  /* =========================
     🧠 Parse Gemini
  ========================= */
  let geminiParsed = [];

  try {
    if (typeof gemini === "string") {
      const cleaned = gemini.replace(/```json|```/g, "");
      geminiParsed = JSON.parse(cleaned);
    } else if (Array.isArray(gemini)) {
      geminiParsed = gemini;
    }

    console.log("🤖 Gemini parsed:", geminiParsed.length);
  } catch (err) {
    console.error("❌ Gemini parse failed:", err.message);
  }

  const bulkBody = [];

  /* =========================
     🚀 BATCH PROCESSING
  ========================= */
  for (let i = 0; i < issues.length; i += BATCH_SIZE) {
    const batch = issues.slice(i, i + BATCH_SIZE);

    console.log(`📦 Processing batch ${i / BATCH_SIZE + 1}, size:`, batch.length);

    const batchPromises = batch.map(async (issue) => {
      try {
        console.log("⚙️ Processing issue:", issue.id);

        const geminiIssue = geminiParsed?.find(
          (g) =>
            g.id === issue.id &&
            (
              g.file === issue.location?.file ||
              g.file === issue.related?.fromFile ||
              !g.file
            )
        );

        const fullText = [
          `Issue ID: ${issue.id}`,
          `Category: ${issue.category}`,
          `Severity: ${issue.severity}`,
          `Title: ${issue.title}`,
          `Description: ${issue.description}`,
          `Evidence: ${JSON.stringify(issue.evidence || {})}`,
          `Impact: ${geminiIssue?.impact || ""}`,
          `Fix: ${(geminiIssue?.fixes || []).join(" ")}`,
        ]
          .filter(Boolean)
          .join("\n");

        /* =========================
           🧬 EMBEDDING
        ========================= */
        let embedding = [];

        try {
          embedding = await generateEmbedding(fullText);
        } catch (err) {
          console.warn(`⚠️ Embedding failed for issue ${issue.id}, continuing...`);
        }

        /* =========================
           ⭐ IMPORTANCE
        ========================= */
        const importanceScore = computeImportanceScore(
          issue,
          geminiIssue
        );

        /* =========================
           🔑 DOC ID
        ========================= */
        const docId = crypto
          .createHash("md5")
          .update(issue.id + scanId + (issue.location?.file || ""))
          .digest("hex");

        return [
          { index: { _index: INDEX_NAME, _id: docId } },
          {
            issue_id: issue.id,
            repo_id: repoId,
            scan_id: scanId,
            project_name: projectName?.toLowerCase?.() || "unknown",

            category: issue.category,
            severity: issue.severity,

            title: issue.title,
            description: issue.description,
            full_text: fullText,

            file_path:
              issue.location?.file ||
              issue.related?.fromFile ||
              null,

            line: issue.location?.line || null,

            tags: [issue.category, issue.severity],

            importance_score: importanceScore,

            gemini_fix: (geminiIssue?.fixes || []).join(" "),
            gemini_confidence:
              geminiIssue?.confidenceScore || 0.5,

            embedding,
            created_at: new Date(),
          },
        ];
      } catch (err) {
        console.error(`❌ Skip issue ${issue.id}:`, err.message);
        return null;
      }
    });

    const results = await Promise.all(batchPromises);

    const validResults = results.filter(Boolean);

    console.log("✅ Valid results in batch:", validResults.length);

    validResults.forEach((pair) => {
      bulkBody.push(pair[0], pair[1]);
    });
  }

  console.log("📦 Final bulk body size:", bulkBody.length);

  /* =========================
     🚀 BULK INSERT
  ========================= */
  if (!bulkBody.length) {
    console.warn("⚠️ No documents to index (bulkBody empty)");
    return;
  }

  const res = await esClient.bulk({
    refresh: true,
    body: bulkBody,
  });

  if (res.errors) {
    console.error("❌ Bulk indexing errors");

    res.items.forEach((item, i) => {
      if (item.index?.error) {
        console.error("❌ Error doc:", bulkBody[i * 2 + 1]);
        console.error("❌ ES error:", item.index.error);
      }
    });
  } else {
    console.log(`🚀 Indexed ${bulkBody.length / 2} issues`);
  }
}