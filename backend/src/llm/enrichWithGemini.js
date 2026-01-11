import { buildLLMPrompt } from "../../../scanner/dist/llm/prompt.js";
import { GoogleGenAI } from "@google/genai";

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
 
    const prompt = buildLLMPrompt(normalizedIssues);

    console.log("GEMINI CALLED 🙂");

    const response = await withTimeout(
      ai.models.generateContent({
        model: "gemini-2.5-flash",
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
      response: text
    };

  } catch (err) {
    console.error("❌ Gemini failed:", err);
    throw err;
  }
}
