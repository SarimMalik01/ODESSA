import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyD1-Aoyi48uls9UdMNZpPhMNLUOiy6dtrE"
});

console.log("Node version:", process.version);
console.log("fetch:", typeof fetch);

const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: "Say hello"
});

console.log("RESPONSE:", response.text);
