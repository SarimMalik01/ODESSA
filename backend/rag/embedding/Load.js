import { pipeline } from "@xenova/transformers";

let embedder = null;

/**
 * Lazy load model once (VERY IMPORTANT)
 */
export async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("✅ Embedding model loaded");
  }
  return embedder;
}