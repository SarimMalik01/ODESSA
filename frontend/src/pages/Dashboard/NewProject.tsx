import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UPLOAD_LOGO from "../../assets/UPLOAD_LOGO.png";
import LOGO_VIDEO from "../../assets/LOGO_VIDEO.gif"
/* =========================
   STATUS MAPPING
   ========================= */
const STATUS_TO_STEP: Record<string, string> = {
  UNZIPPING: "Unzipping files",
  "CONFIGURING YOUR PROJECT": "Configuring your project",
  "IGNITING ENGINE": "Igniting engine",
  "ANALYSING THROUGHPUT": "Analysing throughput",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
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
   🚀 NEW PROJECT
   ========================= */
export default function NewProject() {
  const [projectName, setProjectName] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // polling state
  const [status, setStatus] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  /* =========================
     🔁 POLLING
     ========================= */
  useEffect(() => {
    if (!status) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/projects/latest/status",
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
     📤 UPLOAD
     ========================= */
  const upload = async () => {
    if (!file || !projectName.trim()) return;

    if (!file.name.endsWith(".zip")) {
      alert("Only ZIP files are allowed");
      return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("name", projectName.trim());

    const res = await fetch(
      "http://localhost:5000/api/projects/upload",
      {
        method: "POST",
        credentials: "include",
        body: form,
      }
    );

    if (!res.ok) {
      alert("Upload failed");
      return;
    }

    // start pipeline UI
    setStatus("UNZIPPING");
  };

  const isProcessing =
    status !== null && status !== "COMPLETED" && status !== "FAILED";

  return (
    <div className="rounded-2xl bg-white/5 p-10">

      {/* =========================
          📤 UPLOAD UI
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

          <input
            ref={fileInputRef}
            type="file"
            accept=".zip"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="
              w-64 h-40 rounded-xl
              border border-dashed border-white/30
              flex flex-col items-center justify-center
              cursor-pointer
              hover:border-blue-400 hover:bg-white/5
              transition
            "
          >
            <img
              src={UPLOAD_LOGO}
              alt="Upload"
              className="h-16 w-16 mb-3 opacity-90"
            />

            <p className="text-sm text-white/80">
              {file ? file.name : "Upload ZIP folder"}
            </p>

            <p className="text-xs text-white/40 mt-1">
              Click to choose file
            </p>
          </div>

          <button
            onClick={upload}
            disabled={!file || !projectName.trim()}
            className="
              px-6 py-2 rounded-full
              bg-blue-600/80 hover:bg-blue-600
              disabled:opacity-40
              transition
            "
          >
            Upload ZIP
          </button>
        </div>
      )}

      {/* =========================
          🔁 PIPELINE STATUS
         ========================= */}
      {status && (
        <div
          key={status}
          className="
            flex flex-col items-center space-y-4
            transition-all duration-500 ease-out
            animate-fade-in
          "
        >
             {/* 🔄 Processing Animation */}
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
