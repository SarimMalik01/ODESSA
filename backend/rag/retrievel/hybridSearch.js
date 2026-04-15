import { lexicalSearch } from "./lexicalSearch.js";
import { vectorSearch } from "./semanticSearch.js";

const RRF_K = 60;

/**
 * Hybrid Search (RRF + Importance Scaling)
 */
export async function hybridSearch({
  query,
  projectName,
  topK = 10,
}) {
  /* =========================
     🔍 Run both searches
  ========================= */
  const [bm25Results, vectorResults] = await Promise.all([
    lexicalSearch({ query, projectName, topK: 20 }),
    vectorSearch({ query, projectName, topK: 20 }),
  ]);

  /* =========================
     🧠 Merge using RRF
  ========================= */
  const scoreMap = new Map();

  function applyRRF(results, sourceType) {
    results.forEach((item) => {
      const rrfScore = 1 / (RRF_K + item.rank);

      if (!scoreMap.has(item.id)) {
        scoreMap.set(item.id, {
          id: item.id,
          source: item.source,
          rrfScore: 0,
          importance: item.source.importance_score || 0,
          sources: new Set(),
        });
      }

      const entry = scoreMap.get(item.id);

      // accumulate RRF score
      entry.rrfScore += rrfScore;

      // track which systems retrieved it
      entry.sources.add(sourceType);

      // ✅ IMPORTANT FIX: keep best importance across sources
      entry.importance = Math.max(
        entry.importance,
        item.source.importance_score || 0
      );
    });
  }

  applyRRF(bm25Results, "bm25");
  applyRRF(vectorResults, "vector");

  /* =========================
     ⭐ Apply importance scaling
  ========================= */
  const finalResults = Array.from(scoreMap.values()).map((item) => {
    return {
      id: item.id,
      source: item.source,

      // 🔥 Final scoring formula
      score: item.rrfScore * (0.5 + 0.5 * item.importance),

      sources: Array.from(item.sources),
    };
  });

  /* =========================
     🏆 Sort and return topK
  ========================= */
  finalResults.sort((a, b) => b.score - a.score);

  return finalResults.slice(0, topK);
}