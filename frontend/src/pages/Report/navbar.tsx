import LOGO from "../../assets/LOGO.png";
import LOGO_VIDEO from "../../assets/LOGO_VIDEO.gif";
import { Share2, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ShareDialog from "./ShareDialog";
import CommentSidebar from "./CommentSidebar";

type Props = {
  projectId: string;
  projectName: string;
  currentUser: string;
};

export default function Navbar({
  projectId,
  projectName,
  currentUser,
}: Props) {
  const [openShare, setOpenShare] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [logoHover, setLogoHover] = useState(false);

  const navigate = useNavigate();

  return (
    <>
      <div className="h-14 px-6 flex items-center border-b border-slate-800 bg-slate-900">
        {/* Left */}
        <div className="flex items-center gap-4 min-w-0">
          {/* Logo with hover swap + navigation */}
          <div
            className="
              h-8 w-auto flex items-center
              cursor-pointer
            "
            onMouseEnter={() => setLogoHover(true)}
            onMouseLeave={() => setLogoHover(false)}
            onClick={() => navigate("/dashboard")}
            title="Go to Dashboard"
          >
            <img
              src={logoHover ? LOGO_VIDEO : LOGO}
              alt="ODESSA Logo"
              className="
                h-10 w-auto object-contain
                transition-opacity duration-200
              "
            />
          </div>

          <div className="h-6 w-px bg-slate-700" />

          <div className="text-sm font-semibold text-slate-200 truncate">
            {projectName}
          </div>
        </div>

        <div className="flex-1" />

        {/* Comments */}
        <button
          title="Comments"
          onClick={() => setOpenComments(true)}
          className="
            flex items-center gap-2
            px-3 py-1.5
            rounded-md
            text-slate-400
            hover:text-slate-200
            hover:bg-slate-800
            transition
          "
        >
          <MessageSquare size={16} />
        </button>

        {/* Share */}
        <button
          title="Share project"
          onClick={() => setOpenShare(true)}
          className="
            ml-2 flex items-center gap-2
            px-3 py-1.5
            rounded-md
            text-slate-400
            hover:text-slate-200
            hover:bg-slate-800
            transition
          "
        >
          <Share2 size={16} />
        </button>
      </div>

      {/* Share Dialog */}
      {openShare && (
        <ShareDialog
          open={openShare}
          projectId={projectId}
          onClose={() => setOpenShare(false)}
        />
      )}

      {/* Comments Sidebar */}
      <CommentSidebar
        open={openComments}
        projectId={projectId}
        onClose={() => setOpenComments(false)}
        currentUser={currentUser}
      />
    </>
  );
}
