import { useNavigate } from "react-router-dom";
import type { DashboardTab } from "./Dashboard.tsx";

export default function DashboardTabs({
  activeTab,
  setActiveTab,
}: {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
}) {
  const navigate = useNavigate();

  const Tab = ({ label, tab }: { label: string; tab: DashboardTab }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`
        px-4 py-1 rounded-full text-sm
        transition
        ${
          activeTab === tab
            ? "bg-white text-black"
            : "text-white/70 hover:text-white"
        }
      `}
    >
      {label}
    </button>
  );

  return (
    <div className="inline-flex items-center gap-4 rounded-full border border-white/30 px-6 py-2">
      
      <Tab label="Shared Projects" tab="home" />
      <Tab label="My Projects" tab="projects" />
      <Tab label="New Project" tab="new" />

      {/* 🔥 Ask ODESSA Button */}
      <button
        onClick={() => navigate("/chat")}
        className="
          px-4 py-1 rounded-full text-sm
          border border-blue-400 text-blue-300
          
          shadow-[0_0_6px_#3b82f6]
          hover:shadow-[0_0_18px_#3b82f6,0_0_30px_#3b82f6]

          hover:text-white
          transition-all duration-300
        "
      >
        Ask ODESSA
      </button>

    </div>
  );
}