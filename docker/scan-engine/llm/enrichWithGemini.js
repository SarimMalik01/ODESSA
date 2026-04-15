
import { GoogleGenAI } from "@google/genai";
import { checkAndConsumeTokens } from "../utils/checkAndConsumeTokens.js";
const {
  MAX_GEMINI_COST_INR = "3",
  GEMINI_INPUT_COST_PER_1K_TOKENS_INR = "0.35",
  AVG_CHARS_PER_TOKEN = "4"
} = process.env;

const MAX_COST = Number(MAX_GEMINI_COST_INR);
const COST_PER_1K = Number(GEMINI_INPUT_COST_PER_1K_TOKENS_INR);
const CHARS_PER_TOKEN = Number(AVG_CHARS_PER_TOKEN);


function estimateTokens(text, charsPerToken = 4) {
  return Math.ceil(text.length / charsPerToken);
}

function estimateCostINR(tokens, costPer1k) {
  return (tokens / 1000) * costPer1k;
}



// CommonJS import



const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

function withTimeout(promise, ms) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Gemini timeout"));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}


export async function enrichWithGemini(normalizedIssues) {
  try {
    const { buildLLMPrompt } = await import("../scanner/dist/llm/prompt.js");
    const prompt = buildLLMPrompt(normalizedIssues);
    







    const estimatedTokens = estimateTokens(
      prompt,
      CHARS_PER_TOKEN
    );

    const estimatedCost = estimateCostINR(
      estimatedTokens,
      COST_PER_1K
    );

    console.log(" Gemini estimate:", {
      estimatedTokens,
      estimatedCostINR: estimatedCost
    });


    if (estimatedCost > MAX_COST) {
      const err = new Error(
        `Gemini cost exceeded: ₹${estimatedCost.toFixed(2)} (limit ₹${MAX_COST})`
      );
      err.code = "GEMINI_COST_LIMIT";
      err.meta = {
        reason:"Input Tokens Exceeded MAX LIMIT ",
        estimatedCost,
        estimatedTokens,
        maxAllowedCost: MAX_COST
      };
      throw err;
      
    }
    // anywhere
    const userId = process.env.USER_ID;

    await checkAndConsumeTokens(userId, estimatedTokens);

    console.log("GEMINI CALLED 🙂");

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2
        }
      }),
      1000000
    );

    console.log("Gemini raw response received");

    const text = response.text;
    
    console.log("Gemini call done");
    console.log(" RESPONSE : ",text);
    return {
      response: text,
      usage: {
        estimatedTokens,
        estimatedCostINR: estimatedCost
      }
    };
    

  } catch (err) {
    console.error("❌ Gemini failed:", err);
    throw err;
  }
}
