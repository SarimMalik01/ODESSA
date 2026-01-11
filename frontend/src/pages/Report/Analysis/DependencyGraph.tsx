import type { NormalizedIssue, SelectedNode } from "../types";

type Props = {
  issues: NormalizedIssue[];
  selectedNode: SelectedNode | null;
  onSelect: (node: SelectedNode) => void;
};

export default function DependencyGraph({
  issues,
  selectedNode,
  onSelect,
}: Props) {
  if (issues.length === 0) {
    return (
      <div className="text-sm font-semibold">
        Dependency Graph
      
      <div className="bg-slate-900 border border-slate-800 rounded p-3 text-sm text-slate-500 mt-3">
        No dependency issues found
      </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded p-3 space-y-6">
      <div className="text-sm font-semibold">
        Dependency Graph
      </div>

      {issues.map((issue, index) => {
        /* 🔁 Circular dependency */
        if (issue.cycle && issue.cycle.length > 1) {
          return (
            <div
              key={`cycle-${index}`}
              className="p-3 rounded border border-red-500/30 bg-red-500/5 space-y-2"
            >
              <div className="text-xs font-semibold text-red-400">
                Circular dependency
              </div>

              {issue.cycle.map((file, i) => (
                <div key={`${file}-${i}`} className="flex items-center gap-2">
                  <GraphBlock
                    path={file}
                    selectedNode={selectedNode}
                    onSelect={onSelect}
                  />
                  {i < issue.cycle!.length - 1 && (
                    <span className="text-slate-500">↓</span>
                  )}
                </div>
              ))}
            </div>
          );
        }

        /* ➡️ Layer violation */
        if (issue.from && issue.to) {
          return (
            <div
              key={`${issue.from}-${issue.to}`}
              className="flex items-center gap-3"
            >
              <GraphBlock
                path={issue.from}
                selectedNode={selectedNode}
                onSelect={onSelect}
              />

              <span className="text-slate-500">→</span>

              <GraphBlock
                path={issue.to}
                selectedNode={selectedNode}
                onSelect={onSelect}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

/* ---------------------------------- */
/* Graph block                         */
/* ---------------------------------- */

type GraphBlockProps = {
  path: string;
  selectedNode: SelectedNode | null;
  onSelect: (node: SelectedNode) => void;
};

function GraphBlock({
  path,
  selectedNode,
  onSelect,
}: GraphBlockProps) {
  const isSelected =
    selectedNode?.type === "file" &&
    selectedNode.path === path;

  return (
    <div
      onClick={() =>
        onSelect({
          type: "file",
          path,
        })
      }
      className={`
        px-4 py-2 rounded-md cursor-pointer
        text-sm truncate max-w-[260px]
        transition-colors
        ${
          isSelected
            ? "bg-blue-500 text-white"
            : "bg-slate-700 text-slate-100 hover:bg-slate-600"
        }
      `}
      title={path}
    >
      {path.split("/").pop()}
    </div>
  );
}

