"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Lightbulb, Layers } from "lucide-react";

interface FeedbackTimelineProps {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  diagramComponents: string[];
}

export function FeedbackTimeline({
  strengths,
  weaknesses,
  recommendations,
  diagramComponents,
}: FeedbackTimelineProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Key Architectural Strengths
          </h3>
        </div>
        <ul className="space-y-2">
          {strengths.map((s, idx) => (
            <li
              key={idx}
              className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-200/50 dark:border-emerald-500/20"
            >
              <span className="text-emerald-500 font-bold">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Potential Bottlenecks & Gaps
          </h3>
        </div>
        <ul className="space-y-2">
          {weaknesses.map((w, idx) => (
            <li
              key={idx}
              className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 bg-amber-50/50 dark:bg-amber-500/10 p-2.5 rounded-lg border border-amber-200/50 dark:border-amber-500/20"
            >
              <span className="text-amber-500 font-bold">•</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Lightbulb className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Targeted Next Practice Steps
          </h3>
        </div>
        <ul className="space-y-2">
          {recommendations.map((r, idx) => (
            <li
              key={idx}
              className="text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2 bg-primary/5 p-2.5 rounded-lg border border-primary/20"
            >
              <span className="text-primary font-bold">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {diagramComponents.length > 0 && (
        <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-2.5">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            <Layers className="h-4 w-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Canvas Topology Extracted
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {diagramComponents.map((comp) => (
              <span
                key={comp}
                className="px-2.5 py-0.5 text-xs font-mono rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
