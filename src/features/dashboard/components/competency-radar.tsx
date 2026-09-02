"use client";

import React from "react";
import { SkillRadar } from "@/components/ui/svg-charts";
import type { CompetencyMetric } from "../types";

interface CompetencyRadarProps {
  metrics: CompetencyMetric[];
}

export function CompetencyRadarCard({ metrics }: CompetencyRadarProps) {
  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            System Design Competencies
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Evaluated across functional & non-functional axes
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
          Target: 85%+
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-2">
        <div className="w-full flex justify-center py-2">
          <SkillRadar metrics={metrics} size={250} />
        </div>

        <div className="w-full lg:w-72 space-y-3">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                  {m.label}
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {m.value}%
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${m.value}%`,
                    backgroundColor: m.value >= 80 ? "#BA68C8" : m.value >= 70 ? "#38bdf8" : "#fbbf24",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
