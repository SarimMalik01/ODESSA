import { useEffect, useMemo, useState } from "react";
import { useParams,useLocation } from "react-router-dom";

import Navbar from "./navbar";
import ProjectExplorer from "./project_explorer";
import Analysis from "./Analysis/Analysis";

import type {
  SelectedNode,
  NormalizedIssueRaw,
  NormalizedIssue,
  GeminiIssue,
  FileTreeNode,
} from "./types";

import { normalizePath } from "../../utils/normalizePath";
import { parseGeminiResponse } from "../../utils/parseGeminiResponse";


export default function Report() {
  const { projectId } = useParams();
  console.log(" report loaded : with projectId : ",projectId );
  const location = useLocation();
  const isShared = location.state?.shared;
  const ownerId = location.state?.ownerId;
  const [currentUserId,setCurrentUserId]=useState("");
  const [projectData, setProjectData] = useState<any>(null);
  const [selectedNode, setSelectedNode] =
    useState<SelectedNode | null>(null);
   console.log(" project Id : ",projectId);
  /* =========================
     Fetch project once
  ========================== */
  useEffect(() => {
    async function fetchProject() {
      try {
        const url = isShared && ownerId
          ? `http://localhost:5000/api/projects/${projectId}?ownerId=${ownerId}`
          : `http://localhost:5000/api/projects/${projectId}`;
       
        const res = await fetch(url, {
          credentials: "include",
        });
  
        if (!res.ok) {
          throw new Error("Failed to load project");
        }
  
        const data = await res.json();
        console.log(" Data : ",data)
        setProjectData(data._doc);
        setCurrentUserId(data.currentUserId);
        
      } catch (err) {
        console.error("Failed to fetch project:", err);
      }
    }
  
    fetchProject();
  }, [projectId, isShared, ownerId]);
  

  /* =========================
     Normalize scanner issues
  ========================== */
  const normalizedIssues: NormalizedIssue[] = useMemo(() => {
    if (!projectData?.normalizedIssues) return [];
  
    return (projectData.normalizedIssues as NormalizedIssueRaw[]).map(
      (issue: NormalizedIssueRaw): NormalizedIssue => {
        const file =
          issue.location?.file ??
          issue.evidence?.file ??
          issue.evidence?.from ??
          issue.related?.fromFile;
  
        return {
          id: issue.id,
          category: issue.category,
          severity: issue.severity,
          description: issue.description,
  
          file: normalizePath(file, projectData.workspacePath),
          line: issue.location?.line,
  
          from: normalizePath(issue.evidence?.from, projectData.workspacePath),
          to: normalizePath(issue.evidence?.to, projectData.workspacePath),
  
          cycle: issue.evidence?.cycle
  ?.map((p) => normalizePath(p, projectData.workspacePath))
  .filter((p): p is string => Boolean(p),

          ),
        };
      }
    );
  }, [projectData]);
  
  

  /* =========================
     Parse Gemini issues
  ========================== */
  const geminiIssues: GeminiIssue[] = useMemo(() => {
    if (!projectData?.gemini?.response) return [];

    return parseGeminiResponse(
      projectData?.gemini?.response,
      projectData.workspacePath
    );
  }, [projectData]);

  /* =========================
     Filter by selected node
  ========================== */
  

  const filteredNormalizedIssues = useMemo(() => {
    if (!selectedNode) return normalizedIssues;
  
    // 📄 FILE selected → only NON-architecture issues
    if (selectedNode.type === "file") {
      return normalizedIssues.filter(
        (i) =>
          i.category !== "architecture" &&
          i.file === selectedNode.path
      );
    }
  
    // 📁 FOLDER selected → ALL issues
    return normalizedIssues.filter((i) => {
      // 🧱 Architecture issues
      if (i.category === "architecture") {
        // circular dependency
        if (i.cycle?.length) {
          return i.cycle.some((p) =>
            p.startsWith(selectedNode.path)
          );
        }
  
        // layer / other architecture issue with file
        if (i.file) {
          return i.file.startsWith(selectedNode.path);
        }
  
        return false;
      }
  
      // 🔐 / 🌐 / ⚡ non-architecture issues
      if (!i.file) return false;
      return i.file.startsWith(selectedNode.path);
    });
  }, [normalizedIssues, selectedNode]);
  
  

  const filteredGeminiIssues = useMemo(() => {
    if (!selectedNode) return geminiIssues;
    
    return geminiIssues.filter(
      (i) =>
        i.file &&
        (selectedNode.type === "file"
          ? i.file === selectedNode.path
          : i.file.startsWith(selectedNode.path))
    );
  }, [geminiIssues, selectedNode]);
  console.log("GEMINI ISSUES : ",filteredGeminiIssues)
  console.log(" Normalised issues : ",filteredNormalizedIssues);
  console.log("selectedNode : " ,selectedNode);

  if (!projectData) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200">
      <Navbar projectName={projectData.name} projectId={projectData._id} currentUser={currentUserId}/>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-slate-800 overflow-y-auto">
          <ProjectExplorer
            fileTree={projectData.fileTree as FileTreeNode}
            selectedNode={selectedNode}
            onSelect={setSelectedNode}
            workspacePath={projectData.workspacePath}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-4">
          <Analysis
            selectedNode={selectedNode}
            normalizedIssues={filteredNormalizedIssues}
            geminiIssues={filteredGeminiIssues}
            onSelect={setSelectedNode}
          />
        </main>
      </div>
    </div>
  );
}
