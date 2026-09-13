"use client";

import React from "react";
import type { RubricCategory } from "../types";

interface ScoreBreakdownCardProps {
  rubrics: RubricCategory[];
}

export function ScoreBreakdownCard({ rubrics }: ScoreBreakdownCardProps) {
  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-4">
      <div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
          Evaluator Rubric Breakdown
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          Detailed scores weighted against standard engineering bar standards
        </p>
      </div>

      <div className="space-y-4">
        {rubrics.map((r) => {
          const isHigh = r.score >= 85;
          const isMid = r.score >= 75 && r.score < 85;
          const badgeColor = isHigh
            ? "text-teal-600 dark:text-teal-400"
            : isMid
            ? "text-sky-600 dark:text-sky-400"
            : "text-amber-600 dark:text-amber-400";

          return (
            <div
              key={r.name}
              className="p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/40 dark:bg-zinc-900/30 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {r.name}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    ({r.weight}% weight)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 ${badgeColor}`}>
                    {r.score}/100
                  </span>
                </div>
              </div>

              <div className="w-full bg-zinc-200/70 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${r.score}%`,
                    backgroundColor: isHigh ? "#10b981" : isMid ? "#38bdf8" : "#f59e0b",
                  }}
                />
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {r.summary}
              </p>

              {r.feedbackPoints.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                  {r.feedbackPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
