import { useState } from "react";
import { ChatList } from "./ChatList";
import { ProjectList } from "./ProjectList";
import logo from "../../../assets/LOGO.png";

/* ---------- TYPES ---------- */

type Chat = {
  chatId: string;
  projectName: string;
};

type LeftSidebarProps = {
  onSelectChat: (chat: Chat) => void; // ✅ FIXED
  onSelectProject: (projectName: string) => void;
  projects: string[];
  loadingProjects: boolean;
  onClose: () => void;
};

type TabType = "chats" | "projects";

/* ---------- COMPONENT ---------- */

export default function LeftSidebar({
  onSelectChat,
  onSelectProject,
  projects,
  loadingProjects,
  onClose,
}: LeftSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("chats");

  return (
    <div className="w-full bg-zinc-900 border-r border-white/10 p-4 flex flex-col h-full">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Odessa Logo"
            className="w-10 h-10 object-contain"
          />
        </div>

        <button
          onClick={onClose}
          className="hover:text-white/70"
        >
          ✕
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4 border border-white/10 rounded-full p-1">
        <button
          onClick={() => setActiveTab("chats")}
          className={`flex-1 text-xs py-1 rounded-full transition ${
            activeTab === "chats"
              ? "bg-white text-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          My Chats
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`flex-1 text-xs py-1 rounded-full transition ${
            activeTab === "projects"
              ? "bg-white text-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          My Projects
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chats" ? (
          <ChatList onSelectChat={onSelectChat} />
        ) : loadingProjects ? (
          <div className="text-white/40 text-sm">
            Loading projects...
          </div>
        ) : (
          <ProjectList
            projects={projects}
            onSelectProject={onSelectProject}
          />
        )}
      </div>
    </div>
  );
}