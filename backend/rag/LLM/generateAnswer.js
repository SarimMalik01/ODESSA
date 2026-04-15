import { GoogleGenAI } from "@google/genai";
import { buildRAGPrompt } from "./prompt.js";
import { checkAndConsumeTokens } from "./checkAndConsumeTokens.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================
   Cost config
========================= */
const MAX_COST = Number(process.env.MAX_GEMINI_COST_INR || "3");
const COST_PER_1K = Number(process.env.GEMINI_INPUT_COST_PER_1K_TOKENS_INR || "0.35");
const CHARS_PER_TOKEN = Number(process.env.AVG_CHARS_PER_TOKEN || "4");

function estimateTokens(text) {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function estimateCost(tokens) {
  return (tokens / 1000) * COST_PER_1K;
}

function withTimeout(promise, ms) {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Gemini timeout")), ms);
  });

  return Promise.race([promise, timeout]).finally(() =>
    clearTimeout(timeoutId)
  );
}

/* =========================
   🚀 MAIN FUNCTION
========================= */
export async function generateRAGAnswer({
  query,
  results,
  userId,
}) {
  try {
    /* =========================
       🧠 Build prompt
    ========================= */
    const prompt = buildRAGPrompt({
      query,
      results,
    });

    /* =========================
       💰 Cost estimation
    ========================= */
    const tokens = estimateTokens(prompt);
    const cost = estimateCost(tokens);

    console.log("📊 RAG Gemini estimate:", {
      tokens,
      cost,
    });

    if (cost > MAX_COST) {
      const err = new Error("Gemini cost exceeded");
      err.code = "GEMINI_COST_LIMIT";
      throw err;
    }

    await checkAndConsumeTokens(userId, tokens);

    console.log("🚀 Gemini RAG called");

    /* =========================
       🤖 Call Gemini
    ========================= */
    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      }),
      20000
    );

    const text = response.text;

    console.log("✅ Gemini RAG done");

    return {
      response: text,
      usage: {
        tokens,
        cost,
      },
    };
  } catch (err) {
    console.error("❌ RAG Gemini failed:", err);
    throw err;
  }
}