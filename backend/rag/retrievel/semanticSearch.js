import { esClient } from "../elastic/client.js";
import { generateEmbedding } from "../embedding/generateEmbedding.js";

const INDEX_NAME = "odessa-issues";

/**
 * Optimized Semantic Vector Search for ES v8
 */
export async function vectorSearch({
  query,
  projectName,
  topK = 20,
}) {
  /* =========================
      🧬 Generate Query Vector
     ========================= */
  const queryVector = await generateEmbedding(query);

  const res = await esClient.search({
    index: INDEX_NAME,
    // Note: In v8, 'size' determines how many results are returned to you
    size: topK,
    // 🚀 High-performance kNN search
    knn: {
      field: "embedding",          // Must match your mapping
      query_vector: queryVector,
      k: topK,                     // Number of nearest neighbors to find
      num_candidates: 100,         // Higher = more accurate but slower
      filter: {                    // Scope results to the project
        term: {
          project_name: projectName.toLowerCase(),
        },
      },
    },
  });

  return res.hits.hits.map((hit, index) => ({
    id: hit._id,
    score: hit._score,
    rank: index + 1,
    source: hit._source,
  }));
}