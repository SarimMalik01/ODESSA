import { getEmbedder } from "./Load.js";
/**
 * Generate 384-dim embedding
 */
export async function generateEmbedding(text) {
  const model = await getEmbedder();

  const output = await model(text, {
    pooling: "mean",
    normalize: true, // cosine similarity ready
  });

  // Convert to plain JS array
  return Array.from(output.data);
}