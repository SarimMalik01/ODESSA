import { useState } from "react";
import { X } from "lucide-react";

type Props = {
  onClose: () => void;
};

const TAG_OPTIONS = ["Bug", "Feature Request", "UX", "Performance", "Other"];

export default function FeedbackModal({ onClose }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  const sendFeedback = async () => {
    if (!subject.trim() || !message.trim()) return;

    try {
      setSending(true);

      await fetch("http://127.0.0.1:5000/api/feedback", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          tags,
        }),
      });

      onClose();
    } catch (err) {
      console.error("Feedback send failed:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="
            w-[440px]
            rounded-2xl
            bg-neutral-900
            border border-white/10
            p-6
            relative
            shadow-2xl
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white"
          >
            <X size={18} />
          </button>

          <h2 className="text-lg font-semibold mb-4">
            Send Feedback
          </h2>

          {/* SUBJECT (REQUIRED) */}
          <input
            type="text"
            placeholder="Subject *"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="
              w-full mb-3
              px-3 py-2
              rounded-lg
              bg-white/5
              border border-white/10
              text-sm
              focus:outline-none
              focus:border-blue-500/50
            "
          />

          {/* TAGS (OPTIONAL) */}
          <div className="flex flex-wrap gap-2 mb-3">
            {TAG_OPTIONS.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    px-3 py-1
                    rounded-full
                    text-xs
                    border
                    transition
                    ${
                      active
                        ? "bg-blue-600/30 border-blue-500 text-blue-300"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }
                  `}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* MESSAGE (REQUIRED) */}
          <textarea
            placeholder="Write your message… *"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="
              w-full
              px-3 py-2
              rounded-lg
              bg-white/5
              border border-white/10
              text-sm
              resize-none
              focus:outline-none
              focus:border-blue-500/50
            "
          />

          {/* ACTION */}
          <div className="flex justify-end mt-4">
            <button
              onClick={sendFeedback}
              disabled={sending || !subject.trim() || !message.trim()}
              className="
                px-5 py-2
                rounded-full
                text-sm font-medium
                bg-blue-600 hover:bg-blue-500
                disabled:opacity-40
                transition
              "
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
