import { useEffect, useState } from "react";

/* ---------- TYPES ---------- */

type Chat = {
  chatId: string;
  projectName: string;
  lastMessage?: string;
};

type Props = {
  onSelectChat: (chat: Chat) => void;
};

/* ---------- COMPONENT ---------- */

export function ChatList({ onSelectChat }: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/odessa/chat/chats", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setChats(data);
      })
      .catch((err) => {
        console.error("❌ Failed to load chats:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <div className="text-white/40 text-sm">
        Loading chats...
      </div>
    );
  }

  /* ---------- EMPTY ---------- */
  if (chats.length === 0) {
    return (
      <div className="text-white/40 text-sm">
        No chats yet
      </div>
    );
  }

  /* ---------- LIST ---------- */
  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <div
          key={chat.chatId}
          onClick={() => onSelectChat(chat)}
          className="p-2 border border-white/10 rounded cursor-pointer hover:border-white/30 transition"
        >
          <div className="text-sm text-white font-medium">
            {chat.projectName}
          </div>

          <div className="text-xs text-white/50 truncate">
            {chat.lastMessage || "Start conversation..."}
          </div>
        </div>
      ))}
    </div>
  );
}