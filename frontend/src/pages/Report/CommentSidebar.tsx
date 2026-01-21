import { X, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/* ---------- Types ---------- */

type Comment = {
  _id: string;
  content: string;
  tag: "deadline" | "keep_in_mind" | "important" | "necessary";
  createdAt: string;
  author: {
    userId: string;
    email: string;
  };
};

type Props = {
  open: boolean;
  projectId: string;
  onClose: () => void;
  currentUser:string;
};

/* ---------- Tag Styles ---------- */

const tagStyles: Record<
  Comment["tag"],
  { border: string; text: string }
> = {
  deadline: {
    border: "border-red-500/80",
    text: "text-red-400",
  },
  keep_in_mind: {
    border: "border-green-500/80",
    text: "text-green-400",
  },
  important: {
    border: "border-yellow-400/80",
    text: "text-yellow-300",
  },
  necessary: {
    border: "border-white/30",
    text: "text-white/70",
  },
};

/* ---------- Component ---------- */

export default function CommentSidebar({
  open,
  projectId,
  onClose,
  currentUser
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<Comment["tag"]>("important");
  
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ⬇️ Replace this with your auth context if you have one
  console.log(" current : ",currentUser);

  /* ---------- Fetch comments ---------- */

  useEffect(() => {
    if (!open) return;

    fetch(`http://127.0.0.1:5000/api/projects/${projectId}/comments`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setComments)
      .catch(console.error);
  }, [open, projectId]);

  /* ---------- Auto scroll ---------- */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  /* ---------- Send comment ---------- */

  const sendComment = async () => {
    if (!content.trim()) return;

    const res = await fetch(
      `http://127.0.0.1:5000/api/projects/${projectId}/comments`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tag }),
      }
    );

    const newComment = await res.json();
    setComments((prev) => [...prev, newComment]);
    setContent("");
  };

  /* ---------- UI ---------- */

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 z-50
          h-full w-[380px]
          bg-slate-900 border-l border-slate-800
          flex flex-col
          transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800">
          <div className="font-medium text-slate-200">Comments</div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Comment list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.map((c) => {
            const isMe = c.author.userId === currentUser;
            const style = tagStyles[c.tag];
            console.log(" c.author.userId : ",c.author.userId);
            console.log("content : "
                ,c.content);
            return (
              <div
                key={c._id}
                className={`
                  rounded-xl border
                  ${style.border}
                  bg-black/20
                  p-3
                `}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">
                    {isMe ? "You" : c.author.email}
                  </div>
                  <div className="text-xs text-white/40">
                    {new Date(c.createdAt).toLocaleTimeString()}
                  </div>
                </div>

                {/* Content */}
                <div className="mt-1 text-sm text-white/90">
                  {c.content}
                </div>

                {/* Tag */}
                <div
                  className={`mt-2 text-xs font-medium ${style.text}`}
                >
                  #{c.tag.replace("_", " ")}
                </div>
              </div>
            );
          })}

          {comments.length === 0 && (
            <p className="text-sm text-white/40">
              No comments yet
            </p>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-slate-800 p-3">
          <select
            value={tag}
            onChange={(e) =>
              setTag(e.target.value as Comment["tag"])
            }
            className="
              mb-2 w-full
              bg-slate-800
              text-sm
              p-2
              rounded
              text-white
            "
          >
            <option value="important">Important</option>
            <option value="necessary">Necessary</option>
            <option value="deadline">Deadline</option>
            <option value="keep_in_mind">Keep in mind</option>
          </select>

          <div className="flex gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment…"
              className="
                flex-1
                bg-slate-800
                p-2
                rounded
                text-sm
                text-white
                outline-none
              "
            />

            <button
              onClick={sendComment}
              className="
                p-2
                rounded
                bg-blue-600
                hover:bg-blue-500
                transition
              "
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
