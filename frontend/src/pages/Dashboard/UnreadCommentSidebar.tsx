import { useEffect, useMemo, useState } from "react";
import USER_LOGO from "../../assets/USER_LOGO.png"
type Author = {
  userId: string;
  email: string;
};

type Comment = {
  _id: string;
  projectId: string;
  projectName: string;
  author: Author;
  content: string;
  tag: "deadline" | "important" | "necessary" | "keep_in_mind";
  createdAt: string;
};

type UnreadProject = {
  projectId: string;
  projectName: string;
  unreadCount: number;
  comments: Comment[];
};

function timeAgo(date: string) {
    const seconds = Math.floor(
      (Date.now() - new Date(date).getTime()) / 1000
    );
  
    if (seconds < 60) return "just now";
  
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
  
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
  
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
  
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  }
  

export default function UnreadCommentSidebar() {
  const [data, setData] = useState<UnreadProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnread = async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:5000/api/projects/unread-comments",
        { credentials: "include" }
      );
      const json = await res.json();
      setData(json || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
  }, []);

  const allComments = useMemo(() => {
    return data.flatMap((p) =>
      p.comments.map((c) => ({
        ...c,
        projectName: p.projectName,
      }))
    );
  }, [data]);
  

  const tagCounts = useMemo(() => {
    const c = {
      deadline: 0,
      important: 0,
      necessary: 0,
      keep_in_mind: 0,
    };
    allComments.forEach((x) => (c[x.tag] += 1));
    return c;
  }, [allComments]);

  const markAllAsRead = async () => {
    await fetch(
      "http://127.0.0.1:5000/api/projects/mark-all-read",
      { method: "POST", credentials: "include" }
    );
    fetchUnread();
  };

  return (
    <aside
      className="
        w-[360px]
        shrink-0
        h-[calc(100vh-120px)]
        ml-6
        rounded-2xl
        border border-white/10
        bg-[#0f0f12]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]
        p-4
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">
          Project Notifications
        </h3>

        {allComments.length > 0 && (
          <button
            onClick={markAllAsRead}
            className="
              text-xs
              px-2 py-1
              rounded-md
              bg-white/5
              hover:bg-white/10
              transition
            "
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="text-sm text-white/70 mb-4 space-y-1">
        <div className="font-medium">
          {allComments.length} new comments
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {tagCounts.deadline > 0 && (
            <span className="text-red-400">
              {tagCounts.deadline} deadlines
            </span>
          )}
          {tagCounts.important > 0 && (
            <span className="text-yellow-400">
              {tagCounts.important} important
            </span>
          )}
          {tagCounts.necessary > 0 && (
            <span className="text-white">
              {tagCounts.necessary} necessary
            </span>
          )}
          {tagCounts.keep_in_mind > 0 && (
            <span className="text-green-400">
              {tagCounts.keep_in_mind} keep in mind
            </span>
          )}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto h-full pr-1 space-y-3">
        {!loading && allComments.length === 0 && (
          <div className="text-white/40 text-sm">
            No unread notifications
          </div>
        )}

        {allComments.map((c) => (
           
          <div
            key={c._id}
            className="
              rounded-xl
              p-3
              bg-white/5
              border border-white/10
              backdrop-blur
              hover:bg-white/[0.07]
              transition
            "
          >
            {/* Header */}
            {/* Header row */}
<div className="flex items-center gap-3">
  <img
    src={USER_LOGO}
    alt="User avatar"
    className="
      h-8 w-8
      rounded-full
      object-cover
      border border-white/20
      shadow-sm
    "
  />

  <div className="min-w-0">
    <div className="text-sm font-medium truncate">
      {c.projectName}
    </div>
    <div className="text-xs text-white/50 truncate">
      {c.author.email}
    </div>
  </div>
</div>


            {/* Content */}
            <div className="text-sm text-white/90 mt-2">
              {c.content}
            </div>

            {/* Footer */}
            <div className="flex justify-between mt-2 text-xs text-white/40">
            <span>
  {timeAgo(c.createdAt)}
</span>


              <span
                className={`
                  px-2 py-0.5 rounded-full
                  ${
                    c.tag === "deadline"
                      ? "text-red-400 bg-red-400/10"
                      : c.tag === "important"
                      ? "text-yellow-400 bg-yellow-400/10"
                      : c.tag === "necessary"
                      ? "text-white bg-white/10"
                      : "text-green-400 bg-green-400/10"
                  }
                `}
              >
                #{c.tag.replace("_", " ")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
