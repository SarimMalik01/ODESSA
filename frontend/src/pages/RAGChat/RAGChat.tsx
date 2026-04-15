import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CornerDownLeft } from 'lucide-react';

import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import ChatWindow from "./components/ChatWindow";

type Citation = {
  id: string;
  title: string;
  category: string;
  severity: string;
  file: string;
  description: string;
  importance: number;
};

type Chat = {
  chatId: string;
  projectName: string;
};

export default function RAGChat() {
  const navigate = useNavigate();
  const { projectName, chatId } = useParams();

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(false);

  const [citations, setCitations] = useState<Citation[]>([]);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  const [projects, setProjects] = useState<string[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [currentProject, setCurrentProject] = useState<string | null>(null);

  /* ---------- RESIZE STATE ---------- */
  const [leftWidth, setLeftWidth] = useState(260);
  const [rightWidth, setRightWidth] = useState(300);
  const [resizing, setResizing] = useState<"left" | "right" | null>(null);

  /* ---------- HANDLE RESIZE ---------- */
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!resizing) return;

      if (resizing === "left") {
        setLeftWidth(Math.max(200, Math.min(400, e.clientX)));
      }

      if (resizing === "right") {
        const newWidth = window.innerWidth - e.clientX;
        setRightWidth(Math.max(250, Math.min(500, newWidth)));
      }
    };

    const stopResize = () => setResizing(null);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stopResize);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stopResize);
    };
  }, [resizing]);

  /* ---------- SYNC PROJECT ---------- */
  useEffect(() => {
    if (projectName) setCurrentProject(projectName);
  }, [projectName]);

  /* ---------- FETCH PROJECTS ---------- */
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/projects", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setProjects(data.map((p: any) => p.name));
      })
      .catch(console.error)
      .finally(() => setLoadingProjects(false));
  }, []);

  /* ---------- CREATE CHAT ---------- */
  const handleSelectProject = async (projectName: string) => {
    setCurrentProject(projectName);

    const res = await fetch(
      "http://127.0.0.1:5000/odessa/chat/create-chat",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName }),
      }
    );

    const data = await res.json();
    navigate(`/chat/${projectName}/${data.chatId}`);
  };

  /* ---------- SELECT CHAT ---------- */
  const handleSelectChat = (chat: Chat) => {
    setCurrentProject(chat.projectName);
    navigate(`/chat/${chat.projectName}/${chat.chatId}`);
  };

  /* ---------- FETCH CITATIONS ---------- */
  const handleShowCitations = async (messageId: string) => {
    setSelectedMessageId(messageId);
    setRightOpen(true);

    const res = await fetch(
      `http://127.0.0.1:5000/odessa/chat/message/${chatId}/${messageId}`,
      { credentials: "include" }
    );

    const data = await res.json();
    setCitations(data.citations || []);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white">
      
      {/* LEFT SIDEBAR */}
      {leftOpen && (
        <div
          style={{ width: leftWidth }}
          className="relative flex-shrink-0 h-full"
        >
          <LeftSidebar
            projects={projects}
            loadingProjects={loadingProjects}
            onSelectChat={handleSelectChat}
            onSelectProject={handleSelectProject}
            onClose={() => setLeftOpen(false)}
          />

          {/* RESIZER */}
          <div
            onMouseDown={() => setResizing("left")}
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/40"
          />
        </div>
      )}

      {/* MAIN */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-3">
    <button onClick={() => setLeftOpen((p) => !p)}>☰</button>

    {/* 🔥 Dashboard Link */}
    <button
      onClick={() => navigate("/dashboard")}
      className="text-sm text-grey-400 hover:text-blue-300 transition"
    >
      <CornerDownLeft />
    </button>
  </div>

          <h1 className="text-lg font-semibold tracking-widest">
            {currentProject || "ODESSA"}
          </h1>

          <button onClick={() => setRightOpen((p) => !p)}>⧉</button>
        </div>

        {/* CHAT */}
        <ChatWindow
          chatId={chatId || null}
          projectName={currentProject}
          onShowCitations={handleShowCitations}
        />
      </div>

      {/* RIGHT SIDEBAR */}
      {rightOpen && (
        <div
          style={{ width: rightWidth }}
          className="relative flex-shrink-0 h-full"
        >
          <RightSidebar
            citations={citations}
            onClose={() => setRightOpen(false)}
          />

          {/* RESIZER */}
          <div
            onMouseDown={() => setResizing("right")}
            className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-500/40"
          />
        </div>
      )}
    </div>
  );
}