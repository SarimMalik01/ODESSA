export function buildRAGPrompt({ query, results }) {
  if (!results || results.length === 0) {
    return `
You are a senior software engineer.

User query:
"${query}"

No relevant issues were found.

Return ONLY this JSON:

{
  "summary": "No relevant issues found in the project.",
  "issues": []
}
`;
  }

  const context = results
    .map((item, index) => {
      const src = item.source;

      return `
[Issue ${index + 1}]
ID: ${src.issue_id}
Category: ${src.category}
Severity: ${src.severity}
File: ${src.file_path}
Line: ${src.line}

Title: ${src.title}
Description: ${src.description}

Fix Suggestion:
${src.gemini_fix}
`;
    })
    .join("\n-----------------\n");

  return `
You are an expert static code analysis assistant.

You MUST follow these rules STRICTLY:

- Return ONLY valid JSON
- DO NOT include markdown (no \`\`\`)
- DO NOT include explanations outside JSON
- DO NOT prefix or suffix anything
- Output must start with { and end with }

If unsure, still return valid JSON.

-------------------------
USER QUERY:
${query}
-------------------------

RELEVANT ISSUES:
${context}
-------------------------

OUTPUT FORMAT (STRICT JSON):

{
  "summary": "string",
  "issues": [
    {
      "title": "string",
      "file": "string",
      "line": number,
      "severity": "string",
      "explanation": "string",
      "fix": "string"
    }
  ]
}
`;
}