import express from "express";
import { runRAGPipeline } from "../../rag/index.js";
import { saveMessage } from "../services/chats.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { createChat } from "../controllers/chat.controller.js";
import { getUserChats } from "../controllers/chat.controller.js";
import { ChatModel } from "../models/chats.model.js";
import { getChatMessages } from "../controllers/chat.controller.js";
import { getMessageStatus } from "../controllers/chat.controller.js";
import { getMessageCitations } from "../controllers/chat.controller.js";

const router = express.Router();

/**
 * POST /odessa/chat/:projectName/:chatId
 */
router.post("/:projectName/:chatId", requireAuth, async (req, res) => {
  try {
    const { projectName, chatId } = req.params;
    const { query } = req.body;

    const userId = req.userId;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    /* =========================
       💾 Save USER message
    ========================= */
    await saveMessage({
      chatId,
      userId,
      projectName,
      role: "user",
      content: query,
    });

    /* =========================
       🤖 CREATE BOT MESSAGE (thinking)
    ========================= */
    const chat = await ChatModel.findOne({ chatId, userId });

    chat.messages.push({
      role: "bot",
      content: "",
      state: "thinking",
    });

    await chat.save();

    const botMessage =
      chat.messages[chat.messages.length - 1];

    /* =========================
       🚀 RUN PIPELINE (ASYNC)
    ========================= */
    runRAGPipeline({
      query,
      projectName,
      userId,
      chatId,
      messageId: botMessage._id, // 🔥 PASS THIS
    }).catch(console.error);

    /* =========================
       📤 RETURN IMMEDIATELY
    ========================= */
    return res.json({
      messageId: botMessage._id,
      state: "thinking",
    });

  } catch (err) {
    console.error("❌ Chat error:", err);
    return res.status(500).json({
      error: "Chat processing failed",
    });
  }
});
// routes/chat.routes.js






router.post("/create-chat", requireAuth, createChat);
router.get(
  "/message/:chatId/:messageId",
  requireAuth,
  getMessageStatus
);
router.get("/:projectName/:chatId", requireAuth, getChatMessages);

router.get("/chats", requireAuth, getUserChats);


// routes/chat.routes.js

router.get(
  "/:chatId/message/:messageId/citations",
  requireAuth,
  getMessageCitations
);
export default router;