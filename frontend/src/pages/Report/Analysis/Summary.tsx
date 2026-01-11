import { useMemo } from "react";
import type { GeminiIssue } from "../types";

type Props = {
  geminiIssues: GeminiIssue[];
};

type CategoryKey = "architecture" | "security" | "performance" | "browser";

const CATEGORY_META: Record<
  CategoryKey,
  {
    label: string;
    color: string;
    bg: string;
  }
> = {
  architecture: {
    label: "Architecture",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  security: {
    label: "Security",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  performance: {
    label: "Performance",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  browser: {
    label: "Browser",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
};

export default function Summary({ geminiIssues }: Props) {
  const counts = useMemo<Record<CategoryKey, number>>(() => {
    const base: Record<CategoryKey, number> = {
      architecture: 0,
      security: 0,
      performance: 0,
      browser: 0,
    };

    for (const issue of geminiIssues) {
      if (base[issue.category] !== undefined) {
        base[issue.category]++;
      }
    }

    return base;
  }, [geminiIssues]);

  return (
    <div className="grid grid-cols-4 gap-4">
      {(Object.entries(CATEGORY_META) as [
        CategoryKey,
        (typeof CATEGORY_META)[CategoryKey]
      ][]).map(([key, { label, color, bg }]) => (
        <div
          key={key}
          className={`rounded-lg border border-slate-800 p-4 ${bg}`}
        >
          <div className="text-sm text-slate-400">
            {label}
          </div>

          <div
            className={`mt-2 text-2xl font-semibold ${color}`}
          >
            {counts[key]}
          </div>
        </div>
      ))}
    </div>
  );
}
