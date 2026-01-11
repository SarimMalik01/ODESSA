import { useMemo } from "react";
import type { GeminiIssue } from "../types";

type Props = {
  geminiIssues: GeminiIssue[];
};

type CategoryKey = "architecture" | "security" | "performance" | "browser";

const CATEGORY_META: Record<
  CategoryKey,
  { label: string; color: string; border: string }
> = {
  architecture: {
    label: "Architecture",
    color: "text-blue-400",
    border: "border-blue-500/30",
  },
  security: {
    label: "Security",
    color: "text-red-400",
    border: "border-red-500/30",
  },
  performance: {
    label: "Performance",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
  },
  browser: {
    label: "Browser",
    color: "text-green-400",
    border: "border-green-500/30",
  },
};

function SeverityBadge({ severity }: { severity: GeminiIssue["severity"] }) {
  const map: Record<
    GeminiIssue["severity"],
    string
  > = {
    high: "bg-red-500/20 text-red-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-green-500/20 text-green-400",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${map[severity]}`}
    >
      {severity}
    </span>
  );
}

export default function DetailsAndSuggestions({
  geminiIssues,
}: Props) {
  const grouped = useMemo<Record<CategoryKey, GeminiIssue[]>>(() => {
    const base: Record<CategoryKey, GeminiIssue[]> = {
      architecture: [],
      security: [],
      performance: [],
      browser: [],
    };

    for (const issue of geminiIssues) {
      if (base[issue.category]) {
        base[issue.category].push(issue);
      }
    }

    return base;
  }, [geminiIssues]);

  return (
    <div className="grid grid-cols-2 gap-4">
      {(Object.entries(CATEGORY_META) as [
        CategoryKey,
        typeof CATEGORY_META[CategoryKey]
      ][]).map(([category, meta]) => {
        const issues = grouped[category];

        return (
          <div
            key={category}
            className={`bg-slate-900 border rounded-lg p-4 max-h-[420px] overflow-y-auto ${meta.border}`}
          >
            <div className={`text-sm font-semibold ${meta.color}`}>
              {meta.label}
            </div>

            {issues.length === 0 ? (
              <div className="mt-4 text-sm text-slate-500">
                No issues found
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {issues.map((issue) => (
                  <div
                    key={issue.id}
                    className="border border-slate-800 rounded-md p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-200">
                        {issue.title}
                      </div>
                      <SeverityBadge severity={issue.severity} />
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      Confidence:{" "}
                      {(issue.confidenceScore * 100).toFixed(0)}%
                    </div>

                    <div className="mt-2 text-sm text-slate-300">
                      {issue.description}
                    </div>

                    <div className="mt-2 text-xs text-slate-400 truncate">
                      {issue.file}
                    </div>

                    <div className="mt-3 text-sm">
                      <span className="text-slate-400">Impact:</span>{" "}
                      <span className="text-slate-300">
                        {issue.impact}
                      </span>
                    </div>

                    {issue.fixes.length > 0 && (
                      <div className="mt-2 text-sm">
                        <div className="text-slate-400">
                          Fixes:
                        </div>
                        <ul className="list-disc list-inside text-slate-300">
                          {issue.fixes.map((fix, idx) => (
                            <li key={idx}>{fix}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {issue.possibleFalsePositives.length > 0 && (
                      <div className="mt-2 text-sm">
                        <div className="text-slate-400">
                          Possible false positives:
                        </div>
                        <ul className="list-disc list-inside text-slate-300">
                          {issue.possibleFalsePositives.map(
                            (fp, idx) => (
                              <li key={idx}>{fp}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
