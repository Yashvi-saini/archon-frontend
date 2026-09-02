"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, ExternalLink } from "lucide-react";
import type { RecentInterviewItem } from "../types";

interface RecentInterviewsListProps {
  interviews: RecentInterviewItem[];
}

export function RecentInterviewsList({ interviews }: RecentInterviewsListProps) {
  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Recent Mock Interviews
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Architecture reviews and AI grading history
          </p>
        </div>
        <Link
          href="/reports"
          className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
        >
          View all reports <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {interviews.map((item) => {
          const isHigh = item.score !== null && item.score >= 80;
          const isMedium = item.score !== null && item.score >= 70 && item.score < 80;
          const scoreBadge = isHigh
            ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800"
            : isMedium
            ? "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800"
            : "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800";

          return (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400">
                    {item.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                  <span>{item.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.duration}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${scoreBadge}`}>
                    {item.score !== null ? `${item.score}/100` : "Pending"}
                  </span>
                </div>
                <Link
                  href={`/reports?session_id=${item.sessionId}`}
                  className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                  title="View evaluation"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
