"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ai = void 0;
const genai_1 = require("@google/genai");
const env_1 = require("../utils/env");
exports.ai = new genai_1.GoogleGenAI({
    apiKey: env_1.GEMINI_API_KEY,
});
