"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichWithGemini = enrichWithGemini;
const prompt_1 = require("./prompt");
const gemini_client_1 = require("./gemini-client");
async function enrichWithGemini(issues) {
    const prompt = (0, prompt_1.buildLLMPrompt)(issues);
    console.log(" CALL MADE TO GEMINI ");
    const response = await gemini_client_1.ai.models.generateContent({
        model: "gemini-2.5-flash", // ✅ WORKING MODEL
        contents: prompt,
    });
    return {
        response: response.text
    };
}
