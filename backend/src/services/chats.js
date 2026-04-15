import { ChatModel } from "../models/chats.model.js";

/**
 * Save message to chat
 */
export async function saveMessage({
  chatId,
  userId,
  projectName,
  role,
  content,
  citations = [],
  llmUsage = null, 
}) {
  let chat = await ChatModel.findOne({
    chatId,
    userId,
    projectName,
  });

  if (!chat) {
    chat = new ChatModel({
      chatId,
      userId,
      projectName,
      messages: [],
    });
  }

  const message = {
    role,
    content,
    citations,
  };

  // 🔥 Attach usage ONLY for bot
  if (role === "bot" && llmUsage) {
    message.llmUsage = llmUsage;
  }

  chat.messages.push(message);

  await chat.save();

  return chat;
}