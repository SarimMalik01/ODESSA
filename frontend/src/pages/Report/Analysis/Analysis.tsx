import { useMemo } from "react";
import Summary from "./Summary";
import IssuesList from "./IssuesList";
import DependencyGraph from "./DependencyGraph";
import DetailsAndSuggestions from "./DetailsAndSuggestions";

import type {
  SelectedNode,
  NormalizedIssue,
  GeminiIssue,
} from "../types";

type Props = {
  selectedNode: SelectedNode | null;
  normalizedIssues: NormalizedIssue[];
  geminiIssues: GeminiIssue[];
  onSelect: (node: SelectedNode) => void;
};

export default function Analysis({
  selectedNode,
  normalizedIssues,
  geminiIssues,
  onSelect,
}: Props) {

  /* ----------------------------------
     Architecture issues ONLY for graph
  ---------------------------------- */
  const filteredArchitectureIssues = useMemo(() => {
    // No selection → all architecture issues
    if (!selectedNode) {
      return normalizedIssues.filter(
        (i) => i.category === "architecture"
      );
    }

    // File selected → NO architecture rules
    if (selectedNode.type === "file") {
      return [];
    }

    // Folder selected → architecture issues scoped to folder
    return normalizedIssues.filter((i) => {
      if (i.category !== "architecture") return false;

      // Circular dependency (ARCH-001)
      if (i.cycle && i.cycle.length > 0) {
        return i.cycle.some((p) =>
          p.startsWith(selectedNode.path)
        );
      }

      // Layer violation (ARCH-002)
      if (i.from || i.to) {
        return (
          i.from?.startsWith(selectedNode.path) ||
          i.to?.startsWith(selectedNode.path)
        );
      }

      // Fallback: file-based
      return i.file?.startsWith(selectedNode.path);
    });
  }, [normalizedIssues, selectedNode]);

  return (
    <div className="flex flex-col gap-4">

      {/* Summary */}
      <Summary geminiIssues={geminiIssues} />

      {/* Issues + Dependency graph */}
      <div className="grid grid-cols-2 gap-4 items-start">
        <IssuesList
          selectedNode={selectedNode}
          issues={normalizedIssues}
        />

        <DependencyGraph
          selectedNode={selectedNode}
          issues={filteredArchitectureIssues}
          onSelect={onSelect}
        />
      </div>

      {/* Details */}
      <DetailsAndSuggestions geminiIssues={geminiIssues} />
    </div>
  );
}
