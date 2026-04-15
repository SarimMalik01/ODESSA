import { esClient } from "../elastic/client.js";

const INDEX_NAME = "odessa-issues";

/**
 * BM25 search
 */
export async function lexicalSearch({
  query,
  projectName,
  topK = 20,
}) {
  const res = await esClient.search({
    index: INDEX_NAME,
    size: topK,
    query: {
      bool: {
        must: [
          {
            multi_match: {
              query,
              fields: [
                "title^3",
                "description^2",
                "full_text",
                "gemini_fix",
              ],
              type: "best_fields",
            },
          },
        ],
        filter: [
          {
            term: {
              project_name: projectName.toLowerCase(),
            },
          },
        ],
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