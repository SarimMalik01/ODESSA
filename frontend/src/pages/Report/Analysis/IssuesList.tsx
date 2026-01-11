import type { SelectedNode, NormalizedIssue } from "../types";

type Props = {
  selectedNode: SelectedNode | null;
  issues: NormalizedIssue[];
};

const CATEGORY_COLOR: Record<
  NormalizedIssue["category"],
  string
> = {
  architecture: "text-blue-400 bg-blue-500/10",
  security: "text-red-400 bg-red-500/10",
  performance: "text-yellow-400 bg-yellow-500/10",
  browser: "text-green-400 bg-green-500/10",
};

export default function IssuesList({ selectedNode, issues }: Props) {
  console.log(" issues : ",issues);
  const isFileSelected = selectedNode?.type === "file";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded p-3">
      <div className="mb-2 text-sm font-semibold">Issues</div>

      <table className="w-full text-sm">
        <thead className="text-slate-500">
          <tr>
            {!isFileSelected && <th className="text-left">File</th>}
            <th className="text-left">Type</th>
            <th className="text-left">Description</th>
          </tr>
        </thead>

        <tbody>
          {issues.map((issue) => (
            <tr
            key={`${issue.category}-${issue.file}-${issue.line ?? "na"}`}
              className="border-t border-slate-800 text-slate-300"
            >
              {!isFileSelected && (
                <td className="py-1 truncate max-w-[200px]">
                  {issue.file ?? "-"}
                </td>
              )}

              <td className="py-1">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    CATEGORY_COLOR[issue.category]
                  }`}
                >
                  {issue.id}
                </span>
              </td>

              <td className="py-1">
                {issue.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {issues.length === 0 && (
        <div className="mt-3 text-sm text-slate-500">
          No issues found
        </div>
      )}
    </div>
  );
}
