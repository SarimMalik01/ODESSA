import { useState } from "react";
import { X, Link as LinkIcon } from "lucide-react";

type Props = {
  open: boolean;
  projectId: string;
  onClose: () => void;
};

export default function ShareDialog({
  open,
  projectId,
  onClose,
}: Props) {
  const [expiryDate, setexpiryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  console.log(" sharedialog : ",projectId );
  if (!open) return null;

  const handleCreateLink = async () => {
    if (!expiryDate) {
      setError("Please select an expiry date");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://localhost:5000/api/projects/${projectId}/share`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            expiryDate,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create link");
      }

      setShareLink(data.shareUrl);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-slate-200">
            Share Project
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4">
          {/* Expiry date */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Valid till
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setexpiryDate(e.target.value)}
              className="
                w-full rounded-md bg-slate-800
                border border-slate-700
                px-3 py-2 text-sm
                text-slate-200
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {shareLink && (
            <div className="rounded-md bg-slate-800 p-3 border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">
                Shareable link
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="
                    flex-1 bg-transparent text-sm
                    text-blue-400 truncate
                    focus:outline-none
                  "
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(shareLink)
                  }
                  className="text-slate-400 hover:text-slate-200"
                  title="Copy"
                >
                  <LinkIcon size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCreateLink}
            disabled={loading}
            className="
              px-4 py-2 rounded-md
              bg-blue-600 hover:bg-blue-500
              text-sm font-medium
              disabled:opacity-50
            "
          >
            {loading ? "Creating…" : "Create link"}
          </button>
        </div>
      </div>
    </div>
  );
}
