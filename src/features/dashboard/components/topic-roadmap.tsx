"use client";

import React from "react";
import { CheckCircle, PlayCircle } from "lucide-react";
import type { RoadmapTopic } from "../types";

interface TopicRoadmapProps {
  topics: RoadmapTopic[];
}

export function TopicRoadmapCard({ topics }: TopicRoadmapProps) {
  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            System Design Syllabus Roadmap
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Key architectural paradigms required for Tier 1 engineering interviews
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((t) => {
          const isCompleted = t.status === "completed";
          return (
            <div
              key={t.id}
              className="p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                  {t.category}
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {t.completedLessons}/{t.totalLessons} modules
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-primary shrink-0" />
                )}
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {t.title}
                </h4>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Topic Mastery</span>
                  <span className="font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                    {t.mastery}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200/70 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 bg-primary"
                    style={{ width: `${t.mastery}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
