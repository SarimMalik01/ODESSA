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

  return (
    <div
      className={`
        rounded-xl
        border
        bg-white/5
        p-5
        flex items-center gap-4
        animate-fade-in
        ${
          isCompleted
            ? "border-green-500/40 animate-soft-green"
            : "border-white/10"
        }
      `}
    >
      {/* Spinner / Logo */}
      {!isCompleted && !isFailed && (
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

        {!isCompleted && !isFailed && (
          <span className="text-xs text-white/50">
            {STATUS_TO_LABEL[project.status] ?? "Processing"}
          </span>
        )}

        {isCompleted && (
          <button
            onClick={() => navigate(`/report/${project.projectId}`)}
            className="
              mt-2
              w-fit
              px-3 py-1.5
              text-xs font-semibold
              rounded-full
              bg-green-500/20
              text-green-400
              border border-green-500/30
              hover:bg-green-500/30
              transition
            "
          >
            View Project
          </button>
        )}

        {isFailed && (
          <span className="mt-2 text-xs text-red-400">
            Scan failed
          </span>
        )}
      </div>
    </div>
  );
}
