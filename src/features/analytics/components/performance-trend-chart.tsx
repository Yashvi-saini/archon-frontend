"use client";

import React from "react";
import { AreaTrendChart } from "@/components/ui/svg-charts";
import { TrendingUp } from "lucide-react";
import type { AnalyticsTrendPoint } from "../types";

interface PerformanceTrendChartProps {
  data: AnalyticsTrendPoint[];
}

export function PerformanceTrendChart({ data }: PerformanceTrendChartProps) {
  const currentScore = data[data.length - 1]?.value ?? 0;
  const initialScore = data[0]?.value ?? 0;
  const growth = currentScore - initialScore;

  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Mock Interview Score Trajectory
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Historical rubric scores across successive design problems
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +{growth} pts overall
          </span>
        </div>
      </div>

      <div className="py-2">
        <AreaTrendChart data={data} height={190} />
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
        <span>Baseline: {initialScore} pts</span>
        <span>Target: 80+ pts</span>
        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
          Latest: {currentScore} pts
        </span>
      </div>
    </div>
  );
}
