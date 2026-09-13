"use client";

import React from "react";
import { SkillRadar } from "@/components/ui/svg-charts";
import type { CompetencyMetric } from "../types";

interface CompetencyRadarProps {
  metrics: CompetencyMetric[];
}

export function CompetencyRadarCard({ metrics }: CompetencyRadarProps) {
  return (
    <div className="p-7 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            System Design Competencies
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Evaluated across functional & non-functional axes
          </p>
        </div>
        <span className="text-xs uppercase px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium border border-zinc-200/50 dark:border-zinc-700/50">
          Target: 85%+
        </span>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-3">
        <div className="w-full flex justify-center py-2">
          <SkillRadar metrics={metrics} size={280} />
        </div>

        <div className="w-full lg:w-80 space-y-4">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                  {m.label}
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {m.value}%
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
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
