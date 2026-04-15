import { useState, useEffect } from "react";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { useRef } from "react";
/* ---------- TYPES ---------- */

type Citation = {
  title: string;
  snippet: string;
  score?: number;
};

type Issue = {
  title: string;
  file: string;
  line: number;
  severity: string;
  explanation: string;
  fix: string;
};

type Message = {
  role: "user" | "bot";
  content: any;
  issues?: Issue[]; // 🔥 NEW
  citations?: Citation[];
  state?: string;
  messageId?: string;
};

type Props = {
  chatId: string | null;
  projectName: string | null;
  onShowCitations: (messageId: string) => void;
};

const words = ["Ask", "Explore", "Search", "Discover", "Consult", "Seek"];

export default function ChatWindow({
  chatId,
  projectName,
  onShowCitations,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({}); // 🔥 toggle state

  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!chatRef.current) return;
  
    const el = chatRef.current;
  
    // If user is near bottom → auto scroll
    const isNearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  
    if (isNearBottom) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleScroll = () => {
    if (!chatRef.current) return;
  
    const el = chatRef.current;
  
    const isAtBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 50;
  
    setShowScrollBtn(!isAtBottom);
  };
  /* ---------- WORD ANIMATION ---------- */
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setVisible(true);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  /* ---------- FETCH CHAT ---------- */
  useEffect(() => {
    if (!chatId || !projectName) return;

    const fetchMessages = async () => {
      try {
        setLoadingChat(true);

        const res = await fetch(
          `http://127.0.0.1:5000/odessa/chat/${encodeURIComponent(projectName)}/${chatId}`,
          { credentials: "include" }
        );

        const data = await res.json();

        const formatted = data.messages.map((m: any) => ({
          role: m.role,
          content:
            typeof m.content === "string"
              ? m.content
              : m.content?.summary || "",
          issues: m.content?.issues || [], // 🔥 extract issues
          citations: m.citations || [],
          state: "completed",
          messageId: m._id,
        }));

        setMessages(formatted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingChat(false);
      }
    };

    fetchMessages();
  }, [chatId, projectName]);

  /* ---------- STREAM ---------- */
  const streamText = async (text: string, messageId: string) => {
    let current = "";

    for (let i = 0; i < text.length; i++) {
      current += text[i];
      await new Promise((r) => setTimeout(r, 10));

      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId
            ? { ...msg, content: current }
            : msg
        )
      );
    }
  };

  /* ---------- SEND ---------- */
  const sendMessage = async () => {
    if (!input.trim() || !chatId || !projectName) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((p) => [...p, userMsg]);
    setInput("");

    const res = await fetch(
      `http://127.0.0.1:5000/odessa/chat/${encodeURIComponent(projectName)}/${chatId}`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      }
    );

    const data = await res.json();
    const messageId = data.messageId;

    const botMsg: Message = {
      role: "bot",
      content: "",
      state: "thinking",
      messageId,
    };

    setMessages((p) => [...p, botMsg]);

    const poll = setInterval(async () => {
      const res = await fetch(
        `http://127.0.0.1:5000/odessa/chat/message/${chatId}/${messageId}`,
        { credentials: "include" }
      );

      const data = await res.json();

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.messageId !== messageId) return msg;

          if (data.state === "completed") {
            clearInterval(poll);

            streamText(data.content.summary, messageId);

            return {
              ...msg,
              state: "completed",
              content: "",
              issues: data.content.issues || [], // 🔥 important
              citations: data.citations,
            };
          }

          return { ...msg, state: data.state };
        })
      );
    }, 1000);
  };

  /* ---------- EMPTY ---------- */
  if (!chatId) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <h2 className="text-xl flex gap-2">
          <span
            className={`transition-opacity ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            style={{ color: "#60a5fa" }}
          >
            {words[wordIndex]}
          </span>
          <span className="text-white/40">with Odessa</span>
        </h2>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="relative flex flex-1 flex-col bg-black overflow-hidden">
      <div
  ref={chatRef}
  onScroll={handleScroll}
  className="flex-1 p-6 space-y-4 overflow-y-auto"
>
        {messages.map((m) => (
          <div
            key={m.messageId}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
             className={`px-4 py-3 rounded-xl text-sm ${
                m.role === "user"
                  ? "max-w-md bg-white/10 text-white"
                  : "max-w-2xl bg-blue-900/40 text-white border border-blue-500/20"
              }`}
            >
              {/* STATE */}
              {m.role === "bot" && m.state !== "completed" ? (
                <span className="italic text-white/60 animate-pulse">
                  {m.state === "thinking" && "Thinking..."}
                  {m.state === "synthesizing" && "Synthesizing..."}
                  {m.state === "finalizing" && "Finalizing..."}
                </span>
              ) : (
                <p>{m.content}</p>
              )}

              {/* 🔥 EXPAND BUTTON */}
              {(m.citations?.length ?? 0) > 0 && (
                <button
                  onClick={() =>
                    setExpanded((p) => ({
                      ...p,
                      [m.messageId!]: !p[m.messageId!],
                    }))
                  }
                  className="text-xs text-blue-400 mt-2"
                >
                  {expanded[m.messageId!] ? "Hide Issues" : "View Issues"}
                </button>
              )}

              {/* 🔥 EXPANDED ISSUES */}
              {expanded[m.messageId!] &&
                m.issues?.map((issue, i) => (
                  <div
                    key={i}
                    className="mt-3 p-3 border border-white/10 rounded bg-black/40"
                  >
                    <p className="text-white font-medium">
                      {issue.title}
                    </p>

                    <p className="text-xs text-white/40">
                      {issue.file} : {issue.line}
                    </p>

                    <span
                      className={`text-xs mt-1 inline-block ${
                        issue.severity === "high"
                          ? "text-red-400"
                          : issue.severity === "medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {issue.severity.toUpperCase()}
                    </span>

                    <p className="text-sm text-white/70 mt-2">
                      {issue.explanation}
                    </p>

                    <p className="text-sm text-blue-300 mt-2">
                      Fix: {issue.fix}
                    </p>
                  </div>
                ))}

              {/* CITATIONS */}
              {(m.citations?.length ?? 0) > 0 && (
                <button
                  onClick={() => onShowCitations(m.messageId!)}
                  className="block mt-2 text-xs text-white/50 underline"
                >
                  view citations
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {showScrollBtn && (
  <button
    onClick={() => {
      chatRef.current?.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }}
    className="absolute bottom-24 right-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 shadow-lg transition"
  >
    ↓
  </button>
)}
      {/* INPUT */}
      <div className="border-t border-white/10 pt-4 pb-6 flex justify-center shrink-0">
        <div className="w-full max-w-2xl flex items-center gap-2 bg-zinc-900 rounded-full px-4 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent text-white outline-none"
          />
          <button onClick={sendMessage}>
            <SendOutlinedIcon style={{ transform: "rotate(-90deg)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}