"use client";

import React from "react";
import { RadialScoreGauge } from "@/components/ui/svg-charts";
import { Target, TrendingUp } from "lucide-react";

interface ReadinessIndexGaugeProps {
  score: number;
  percentile: number;
  targetLevel: string;
}

export function ReadinessIndexGauge({ score, percentile, targetLevel }: ReadinessIndexGaugeProps) {
  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs flex flex-col justify-between space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Architecture Readiness Index
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Probabilistic readiness score for Tier 1 interviews
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <RadialScoreGauge
          value={score}
          size={140}
          strokeWidth={12}
          label="Readiness"
          sublabel="Scale 0-100"
          colorClassName="text-primary"
        />

        <div className="space-y-2 text-center sm:text-left">
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Peer Standing</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Top {100 - percentile}% of candidates
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-400 block font-medium">Target Calibration</span>
            <span className="text-xs font-semibold text-primary">
              {targetLevel}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="h-3 w-3" /> Ready for Senior loop
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center sm:text-left">
        <p className="text-[11px] text-zinc-400">
          Scored by combining whiteboard topological correctness, latency estimates, and trade-off depth.
        </p>
      </div>
    </div>
  );
}
