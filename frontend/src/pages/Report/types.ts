/* ===========================
   Tree & Selection
=========================== */

export type NodeType = "file" | "directory";

export type SelectedNode = {
  type: NodeType;
  path: string;
};

export type FileTreeNode = {
  name: string;
  path: string;
  type: NodeType;
  children?: FileTreeNode[];
};

/* ===========================
   BACKEND NORMALIZED ISSUE
   (RAW – DO NOT FLATTEN)
=========================== */

export type NormalizedIssueRaw = {
  id: string;
  category: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;

  /* Security / browser issues */
  location?: {
    file?: string;
    line?: number;
  };

  /* Architecture issues */
  related?: {
    fromFile?: string;
    toFile?: string;
  };

  evidence?: {
    from?: string;
    to?: string;
    cycle?: string[];
    file:string
  };
};

/* ===========================
   UI NORMALIZED ISSUE
   (FLATTENED, SAFE)
=========================== */

export type NormalizedIssue = {
  id: string;
  category: string;
  severity: "low" | "medium" | "high";
  description: string;

  file?: string;
  line?: number;

  /* Architecture-specific */
  from?: string;
  to?: string;
  cycle?: string[];
};

/* ===========================
   GEMINI ENRICHED ISSUE
=========================== */

export type GeminiIssue = {
  id: string;
  category: "architecture" | "security" | "performance" | "browser";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;

  file: string | null;

  confidenceScore: number;
  impact: string;
  fixes: string[];
  possibleFalsePositives: string[];
};
