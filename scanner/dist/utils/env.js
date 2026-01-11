"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEMINI_API_KEY = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Add it to your .env file.");
}
exports.GEMINI_API_KEY = process.env.GEMINI_API_KEY;
