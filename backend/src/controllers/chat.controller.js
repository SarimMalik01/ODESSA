// controllers/chat.controller.js

import { v4 as uuidv4 } from "uuid";
import { ChatModel } from "../models/chats.model.js";

export const createChat = async (req, res) => {
  try {
    const { projectName } = req.body;
    const userId = req.userId;

    if (!projectName) {
      return res.status(400).json({
        error: "projectName is required",
      });
    }

    const chatId = uuidv4();

    await ChatModel.create({
      chatId,
      userId,
      projectName,
      messages: [],
    });

    return res.json({
      chatId,
      projectName,
    });
  } catch (err) {
    console.error("❌ Create chat failed:", err);
    res.status(500).json({
      error: "Failed to create chat",
    });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.userId;

    const chats = await ChatModel.find({ userId })
      .sort({ updatedAt: -1 }) // latest first
      .select("chatId projectName lastMessage updatedAt");

    return res.json(chats);
  } catch (err) {
    console.error("❌ Fetch chats failed:", err);
    return res.status(500).json({
      error: "Failed to fetch chats",
    });
  }
};


export const getChatMessages = async (req, res) => {
  try {
    const { chatId, projectName } = req.params;
    const userId = req.userId;

    const chat = await ChatModel.findOne({
      chatId,
      userId,
      projectName,
    });

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    return res.json({
      chatId: chat.chatId,
      projectName: chat.projectName,
      messages: chat.messages,
    });
  } catch (err) {
    console.error("❌ Fetch chat messages failed:", err);

    return res.status(500).json({
      error: "Failed to fetch chat messages",
    });
  }
};

export const getMessageStatus = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.userId;

    const chat = await ChatModel.findOne({
      chatId,
      userId,
    });

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    /* 🔥 find message inside array */
    const message = chat.messages.id(messageId);

    if (!message) {
      return res.status(404).json({
        error: "Message not found",
      });
    }

    return res.json({
      state: message.state || "completed",
      content: message.content || "",
      citations: message.citations || [],
    });
  } catch (err) {
    console.error("❌ Fetch message status failed:", err);

    return res.status(500).json({
      error: "Failed to fetch message status",
    });
  }
};

// controllers/chat.controller.js


export const getMessageCitations = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const userId = req.userId;

    const chat = await ChatModel.findOne({
      chatId,
      userId,
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const message = chat.messages.id(messageId);

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    return res.json({
      citations: message.citations || [],
    });
  } catch (err) {
    console.error("❌ Fetch citations failed:", err);
    res.status(500).json({ error: "Failed to fetch citations" });
  }
};