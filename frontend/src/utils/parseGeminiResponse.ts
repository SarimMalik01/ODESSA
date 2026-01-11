import type { GeminiIssue } from "../pages/Report/types";
import { normalizePath } from "./normalizePath";

export function parseGeminiResponse(
  raw: unknown,
  workspacePath: string
): GeminiIssue[] {
  if (!raw) return [];

  let parsed: unknown;

  // Gemini wraps JSON inside ```json ... ```
  if (typeof raw === "string") {
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    parsed = JSON.parse(cleaned);
  } else if (typeof raw === "object" && "response" in raw) {
    return parseGeminiResponse(
      (raw as any).response,
      workspacePath
    );
  } else {
    parsed = raw;
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.map((issue) => ({
    ...issue,
    file: normalizePath(issue.file, workspacePath),
  }));
}
