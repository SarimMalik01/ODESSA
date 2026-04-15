import { useState } from "react";
import { Mail } from "lucide-react";

import DashboardTabs from "./DashBoardTabs";
import SharedProjects from "./SharedProjects";
import MyProjects from "./MyProjects";
import NewProject from "./NewProject";
import UnreadCommentSidebar from "./UnreadCommentSidebar";
import ProfileModal from "./ProfileModal";
import ActiveScanCard from "../Dashboard/ActiveScanCard";
import FeedbackModal from "./FeedbackModal";

import PROFILE_LOGO from "../../assets/PROFILE_LOGO.png";

export type DashboardTab = "home" | "projects" | "new";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("home");
  const [openProfile, setOpenProfile] = useState(false);
  const [openFeedback, setOpenFeedback] = useState(false);

  return (
    <div className="min-h-screen text-white">

      {/* =========================
          TOP BAR
         ========================= */}
      <div
        className="
          h-14
          flex items-center justify-end
          px-6 gap-3
          bg-gray-750
          backdrop-blur-md
          border-b border-white/10
        "
      >
        {/* FEEDBACK ICON */}
        <button
          onClick={() => setOpenFeedback(true)}
          className="
            w-9 h-9
            rounded-full
            bg-white/10
            hover:bg-white/20
            transition
            flex items-center justify-center
          "
        >
          <Mail size={16} />
        </button>

        {/* PROFILE AVATAR */}
        <button
          onClick={() => setOpenProfile(true)}
          className="
            w-9 h-9
            rounded-full
            overflow-hidden
            bg-white/10
            hover:bg-white/20
            transition
            flex items-center justify-center
          "
        >
          <img
            src={PROFILE_LOGO}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </button>
      </div>

      {/* =========================
          PAGE CONTENT
         ========================= */}
      <div className="px-12 py-10">
        <h1 className="text-7xl font-semibold mb-6 ml-4">
          Welcome Back!
        </h1>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <DashboardTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* Main layout */}
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {activeTab === "home" && <SharedProjects />}
            {activeTab === "projects" && <MyProjects />}
            {activeTab === "new" && <NewProject />}
          </div>

          <div className="w-[340px] shrink-0 flex flex-col gap-4">
            <ActiveScanCard />
            <UnreadCommentSidebar />
          </div>
        </div>
      </div>

      {/* =========================
          MODALS
         ========================= */}
      {openProfile && (
        <ProfileModal onClose={() => setOpenProfile(false)} />
      )}

      {openFeedback && (
        <FeedbackModal onClose={() => setOpenFeedback(false)} />
      )}
    </div>
  );
}
