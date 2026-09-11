"use client";

import React from "react";
import { CheckCircle, PlayCircle } from "lucide-react";
import type { RoadmapTopic } from "../types";

interface TopicRoadmapProps {
  topics: RoadmapTopic[];
}

export function TopicRoadmapCard({ topics }: TopicRoadmapProps) {
  return (
    <div className="p-7 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
            System Design Syllabus Roadmap
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Key architectural paradigms required for Tier 1 engineering interviews
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {topics.map((t) => {
          const isCompleted = t.status === "completed";
          return (
            <div
              key={t.id}
              className="p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40 space-y-3 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {t.category}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {t.completedLessons}/{t.totalLessons} modules
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <PlayCircle className="h-5 w-5 text-primary shrink-0" />
                )}
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {t.title}
                </h4>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Topic Mastery</span>
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {t.mastery}%
                  </span>
                </div>
                <div className="w-full bg-zinc-200/70 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
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
