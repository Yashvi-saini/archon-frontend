"use client";

import React from "react";
import type { HeatmapDay } from "../types";

interface ActivityHeatmapProps {
  days: HeatmapDay[];
}

export function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return "bg-zinc-100 dark:bg-zinc-800/60";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/60";
    return "bg-primary";
  };

  const totalSessions = days.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            System Design Practice Consistency
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {totalSessions} mock & quiz activities across the last 12 weeks
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-xs bg-zinc-100 dark:bg-zinc-800/60" />
          <div className="w-2.5 h-2.5 rounded-xs bg-primary/30" />
          <div className="w-2.5 h-2.5 rounded-xs bg-primary/60" />
          <div className="w-2.5 h-2.5 rounded-xs bg-primary" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-1.5 min-w-full justify-between">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} architecture sessions`}
                  className={`w-3 h-3 rounded-xs ${getColor(day.count)} transition-transform hover:scale-125 cursor-pointer`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
        <span>Consistency Goal: 4+ sessions / week</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          Current: On Track
        </span>
      </div>
    </div>
  );
}
