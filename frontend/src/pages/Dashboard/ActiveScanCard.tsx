import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LOGO_VIDEO from "../../assets/LOGO_VIDEO.gif";

/* =========================
   STATUS LABELS
   ========================= */
const STATUS_TO_LABEL: Record<string, string> = {
  ENQUEUEING: "Enqueueing your repository",
  CLONING: "Cloning your repository",
  CONFIGURING: "Configuring your project",
  SCANNING: "Igniting engine",
  ANALYZING: "Analysing throughput",
};

type ActiveProject = {
  projectId: string;
  name: string;
  status: string;
};

export default function ActiveScanCard() {
  const [project, setProject] = useState<ActiveProject | null>(null);
  const navigate = useNavigate();

  const fetchActiveScan = async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:5000/api/projects/active",
        { credentials: "include" }
      );

      if (!res.ok) return;

      const data = await res.json();

      if (!data.exists) {
        setProject(null);
        return;
      }

      setProject(data.project);
    } catch (err) {
      console.error("Active scan fetch failed:", err);
    }
  };

  /* =========================
     MARK AS SEEN
     ========================= */
  const markAsSeen = async () => {
    if (!project) return;

    try {
      await fetch(
        `http://127.0.0.1:5000/api/projects/${project.projectId}/seen`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      // Remove card immediately from UI
      setProject(null);
    } catch (err) {
      console.error("Mark as seen failed:", err);
    }
  };

  /* =========================
     POLLING
     ========================= */
  useEffect(() => {
    fetchActiveScan();
    const interval = setInterval(fetchActiveScan, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!project) return null;

  const isCompleted = project.status === "COMPLETED";
  const isFailed = project.status === "FAILED";
  const isBlocked = project.status === "BLOCKED";
  const isTerminal = isCompleted || isFailed || isBlocked;

  return (
    <div
      className={`
        rounded-xl border bg-white/5 p-5
        flex items-center gap-4 animate-fade-in
        ${
          isCompleted
            ? "border-green-500/40 animate-soft-green"
            : isFailed
            ? "border-red-500/30"
            : isBlocked
            ? "border-gray-500/30"
            : "border-white/10"
        }
      `}
    >
      {/* Spinner / Logo */}
      {!isTerminal && (
        <img
          src={LOGO_VIDEO}
          alt="ODESSA scanning"
          className="h-10 w-10 opacity-90"
        />
      )}

      {/* Text + CTA */}
      <div className="flex flex-col flex-1">
        <span className="text-sm text-white/80 font-medium">
          {project.name}
        </span>

        {!isTerminal && (
          <span className="text-xs text-white/50">
            {STATUS_TO_LABEL[project.status] ?? "Processing"}
          </span>
        )}

        {/* COMPLETED */}
        {isCompleted && (
          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => navigate(`/report/${project.projectId}`)}
              className="
                px-3 py-1.5 text-xs font-semibold rounded-full
                bg-green-500/20 text-green-400
                border border-green-500/30
                hover:bg-green-500/30 transition
              "
            >
              View Project
            </button>

            <button
              onClick={markAsSeen}
              className="
                px-3 py-1.5 text-xs rounded-full
                bg-white/5 text-white/60
                border border-white/10
                hover:bg-white/10 transition
              "
            >
              Mark as seen
            </button>
          </div>
        )}

        {/* FAILED */}
        {isFailed && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-red-400">Scan failed</span>
            <button
              onClick={markAsSeen}
              className="
                px-3 py-1.5 text-xs rounded-full
                bg-white/5 text-white/60
                border border-white/10
                hover:bg-white/10 transition
              "
            >
              Mark as seen
            </button>
          </div>
        )}

        {/* BLOCKED */}
        {isBlocked && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">Analysis blocked</span>
            <button
              onClick={markAsSeen}
              className="
                px-3 py-1.5 text-xs rounded-full
                bg-white/5 text-white/60
                border border-white/10
                hover:bg-white/10 transition
              "
            >
              Mark as seen
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
