import { esClient } from "./client.js";

const INDEX_NAME = "odessa-issues";

export async function ensureIndex() {
  const exists = await esClient.indices.exists({
    index: INDEX_NAME,
  });

  if (exists) {
    console.log("🟢 ES index already exists");
    return;
  }

  await esClient.indices.create({
    index: INDEX_NAME,

    settings: {
      analysis: {
        normalizer: {
          lowercase_normalizer: {
            type: "custom",
            filter: ["lowercase"],
          },
        },
      },
    },

    mappings: {
      properties: {
        // ========================
        // 🔑 IDENTITY
        // ========================
        issue_id: { type: "keyword" },
        repo_id: { type: "keyword" },
        scan_id: { type: "keyword" },

        // ========================
        // 🧠 PROJECT CONTEXT
        // ========================
        project_name: {
          type: "keyword",
          normalizer: "lowercase_normalizer",
        },

        // ========================
        // 🧩 CLASSIFICATION
        // ========================
        category: { type: "keyword" },
        severity: { type: "keyword" },

        // ========================
        // 🔍 TEXT SEARCH (BM25)
        // ========================
        title: {
          type: "text",
          fields: {
            keyword: { type: "keyword" },
          },
        },

        description: { type: "text" },

        full_text: {
          type: "text",
          analyzer: "standard",
        },

        // ========================
        // 📂 CODE CONTEXT
        // ========================
        file_path: { type: "keyword" },
        line: { type: "integer" },

        // ========================
        // 🏷 TAGS
        // ========================
        tags: { type: "keyword" },

        // ========================
        // ⭐ RANKING SIGNAL
        // ========================
        importance_score: { type: "float" },

        // ========================
        // 🤖 LLM ENRICHMENT
        // ========================
        gemini_fix: { type: "text" },
        gemini_confidence: { type: "float" },

        // ========================
        // 🧬 VECTOR SEARCH
        // ========================
        embedding: {
          type: "dense_vector",
          dims: 384,
          index: true,
          similarity: "cosine",
        },

        // ========================
        // 🕒 META
        // ========================
        created_at: { type: "date" },
      },
    },
  });

  console.log("✅ ES index created");
}