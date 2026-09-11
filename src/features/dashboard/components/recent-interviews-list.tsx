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
    <div className="p-7 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">
            Recent Mock Interviews
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Architecture reviews and AI grading history
          </p>
        </div>
        <Link
          href="/reports"
          className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
        >
          View all reports <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {interviews.map((item) => {
          const isHigh = item.score !== null && item.score >= 80;
          const isMedium = item.score !== null && item.score >= 70 && item.score < 80;
          const scoreBadge = isHigh
            ? "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800"
            : isMedium
            ? "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-950/50 dark:border-sky-800"
            : "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800";

          return (
            <div
              key={item.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium">
                    {item.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <span>{item.date}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {item.duration}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="text-right">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${scoreBadge}`}>
                    {item.score !== null ? `${item.score}/100` : "Pending"}
                  </span>
                </div>
                <Link
                  href={`/reports?session_id=${item.sessionId}`}
                  className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  title="View evaluation"
                >
                  <ExternalLink className="h-4.5 w-4.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
