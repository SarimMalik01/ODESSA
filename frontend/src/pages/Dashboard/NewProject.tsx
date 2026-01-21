import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LOGO_VIDEO from "../../assets/LOGO_VIDEO.gif";
import { Github } from "lucide-react";

/* =========================
   STATUS MAPPING
   ========================= */
   const STATUS_TO_STEP: Record<string, string> = {
    ENQUEUEING: "Enqueueing your repository",
    CLONING: "Cloning your repository",
    CONFIGURING: "Configuring your project",
    SCANNING: "Igniting engine",
    ANALYZING: "Analysing throughput",
    COMPLETED: "Completed",
    FAILED: "Failed",
  };
  

/* =========================
   🔵 LOADING DOTS
   ========================= */
function LoadingDots() {
  return (
    <span className="inline-flex ml-1">
      <span className="animate-bounce [animation-delay:0ms]">.</span>
      <span className="animate-bounce [animation-delay:150ms]">.</span>
      <span className="animate-bounce [animation-delay:300ms]">.</span>
    </span>
  );
}

/* =========================
   🚀 NEW PROJECT (REPO BASED)
   ========================= */
export default function NewProject() {
  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  // polling state
  const [status, setStatus] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const navigate = useNavigate();

  /* =========================
     🔁 POLLING
     ========================= */
  useEffect(() => {
    if (!status) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:5000/api/projects/latest/status",
          { credentials: "include" }
        );

        if (!res.ok) return;

        const json = await res.json();

        setStatus(json.status);

        if (json.projectId && !projectId) {
          setProjectId(json.projectId);
        }

        if (json.status === "COMPLETED" || json.status === "FAILED") {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Polling failed:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status, projectId]);

  /* =========================
     📤 CREATE PROJECT (REPO)
     ========================= */
     const upload = async () => {
      if (!repoUrl.trim() || !projectName.trim()) return;
    
      try {
        const res = await fetch(
          "http://127.0.0.1:5000/api/projects/upload",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: repoUrl.trim(),
              name: projectName.trim(),
            }),
          }
        );
    
        // 🔐 PRIVATE REPO → OAUTH REQUIRED
        if (res.status === 401) {
          const data = await res.json();
    
          if (data.code === "OAUTH_REQUIRED") {
            // Optional UX feedback
            alert("This is a private repository. Redirecting to GitHub for authorization.");
    
            const params = new URLSearchParams({
              repoUrl: data.repoUrl,
              projectName: data.projectName,
            });
    
            window.location.href =
              `http://127.0.0.1:5000/auth/github?${params.toString()}`;
    
            return;
          }
        }
    
        // ❌ Any other error
        if (!res.ok) {
          alert("Failed to enqueue project");
          return;
        }
    
        // ✅ PUBLIC REPO → START PIPELINE UI
        setStatus("ENQUEUEING");
    
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Something went wrong");
      }
    };
    

  const isProcessing =
    status !== null && status !== "COMPLETED" && status !== "FAILED";

  return (
    <div className="rounded-2xl bg-white/5 p-10">
      {/* =========================
          📤 INPUT UI
         ========================= */}
      {!status && (
        <div className="flex flex-col items-center gap-6">
          <input
            type="text"
            placeholder="Project name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="
              w-64 px-4 py-2 rounded-lg
              bg-white/10 border border-white/20
              text-white placeholder-white/40
              focus:outline-none focus:ring-2 focus:ring-blue-500/60
            "
          />

<div
  className="
    flex items-center
    w-96
    rounded-lg
    bg-white/10
    border border-white/20
    focus-within:ring-2 focus-within:ring-blue-500/60
  "
>
  {/* GitHub icon */}
  <div className="pl-3 pr-2 text-white/60">
    <Github className="h-4 w-4" />
  </div>

  {/* Divider */}
  <div className="h-5 w-px bg-white/20" />

  {/* Input */}
  <input
    type="text"
    placeholder="Paste GitHub repository URL"
    value={repoUrl}
    onChange={(e) => setRepoUrl(e.target.value)}
    className="
      flex-1
      bg-transparent
      px-3 py-2
      text-white
      placeholder-white/40
      focus:outline-none
    "
  />
</div>




          <button
            onClick={upload}
            disabled={!repoUrl.trim() || !projectName.trim()}
            className="
              px-6 py-2 rounded-full
              bg-blue-600/80 hover:bg-blue-600
              disabled:opacity-40
              transition
            "
          >
            Analyse Repository
          </button>
        </div>
      )}

      {/* =========================
          🔁 PIPELINE STATUS
         ========================= */}
      {status && (
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          {isProcessing && (
            <img
              src={LOGO_VIDEO}
              alt="Processing"
              className="h-20 w-20 mb-1 opacity-90"
            />
          )}

          <p className="text-white/70 text-sm tracking-wide flex items-center">
            {STATUS_TO_STEP[status] ?? "Processing"}
            {isProcessing && <LoadingDots />}
          </p>

          {status === "COMPLETED" && projectId && (
            <div className="flex flex-col items-center gap-3">
              <span
                className="
                  px-3 py-1 text-xs font-semibold rounded-full
                  bg-green-500/20 text-green-400
                  border border-green-500/30
                "
              >
                ✔ Analysis Complete
              </span>

              <button
                onClick={() => navigate(`/report/${projectId}`)}
                className="
                  mt-2 px-6 py-2 rounded-full
                  bg-green-600/80 hover:bg-green-600
                  transition
                "
              >
                View Project
              </button>
            </div>
          )}

          {status === "FAILED" && (
            <p className="text-red-400 text-sm">
              Something went wrong during analysis
            </p>
          )}
        </div>
      )}
    </div>
  );
}
