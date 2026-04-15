import { hybridSearch } from "./retrievel/hybridSearch.js";
import { generateRAGAnswer } from "./LLM/generateAnswer.js";
import { ChatModel } from "../src/models/chats.model.js";

function cleanJSON(text) {
  if (!text) return "";

  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first !== -1 && last !== -1) {
    text = text.slice(first, last + 1);
  }

  return text;
}

export async function runRAGPipeline({
  query,
  projectName,
  userId,
  chatId,
  messageId, // 🔥 REQUIRED
}) {
  try {
    /* =========================
       🔍 Step 1: Retrieve
    ========================= */
    const results = await hybridSearch({
      query,
      projectName,
      topK: 10,
    });

    /* 🔥 UPDATE → SYNTHESIZING */
    await ChatModel.updateOne(
      { chatId, "messages._id": messageId },
      { $set: { "messages.$.state": "synthesizing" } }
    );

    console.log(" results : ",results.length);

    /* =========================
       ⚠️ No results
    ========================= */
    if (!results.length) {
      await ChatModel.updateOne(
        { chatId, "messages._id": messageId },
        {
          $set: {
            "messages.$.state": "completed",
            "messages.$.content": {
              summary: "No relevant issues found in this project.",
              issues: [],
            },
            "messages.$.citations": [],
          },
        }
      );
      return;
    }

    /* =========================
       🤖 Step 2: LLM
    ========================= */
    const llmResponse = await generateRAGAnswer({
      query,
      results,
      userId,
    });

    /* 🔥 UPDATE → FINALIZING */
    await ChatModel.updateOne(
      { chatId, "messages._id": messageId },
      { $set: { "messages.$.state": "finalizing" } }
    );

    let parsed;

    try {
      console.log("🧾 RAW Gemini:", llmResponse.response);

      const cleaned = cleanJSON(llmResponse.response);
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Failed to parse Gemini response");

      parsed = {
        summary: "Could not generate structured response.",
        issues: [],
      };
    }

    const citations = results.map((r) => ({
      id: r.id,
      category: r.source.category,
      title: r.source.title,
      severity: r.source.severity,
      file: r.source.file_path,
      description: r.source.description,
      importance: r.source.importance_score,
    }));

    /* =========================
       ✅ FINAL UPDATE
    ========================= */
    await ChatModel.updateOne(
      { chatId, "messages._id": messageId },
      {
        $set: {
          "messages.$.state": "completed",
          "messages.$.content": parsed,
          "messages.$.citations": citations,
          "messages.$.llmUsage": llmResponse.usage,
        },
      }
    );
  } catch (err) {
    console.error("🔥 RAG pipeline failed:", err);

    /* 🔥 FAIL SAFE */
    await ChatModel.updateOne(
      { chatId, "messages._id": messageId },
      {
        $set: {
          "messages.$.state": "completed",
          "messages.$.content": {
            summary: "Something went wrong.",
            issues: [],
          },
        },
      }
    );
  }
}