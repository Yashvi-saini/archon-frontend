"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Info, Sparkles } from "lucide-react";
import type { PitfallInsight } from "../types";

interface PitfallInsightsProps {
  pitfalls: PitfallInsight[];
}

export function PitfallInsights({ pitfalls }: PitfallInsightsProps) {
  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Automated Pitfall & Antipattern Detection
          </h3>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
          AI Architecture Engine
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pitfalls.map((p) => {
          const isCrit = p.category === "critical";
          const isWarn = p.category === "warning";
          const Icon = isCrit ? AlertCircle : isWarn ? AlertTriangle : Info;
          const colorClass = isCrit
            ? "border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400"
            : isWarn
            ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"
            : "border-sky-200 dark:border-sky-900/40 bg-sky-50/40 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400";

          return (
            <div
              key={p.id}
              className={`p-4 rounded-xl border space-y-2 flex flex-col justify-between ${colorClass}`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <h4 className="text-xs font-bold leading-tight">{p.title}</h4>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-current/10">
                <span>Impact: {p.impact}</span>
                <span>{p.frequency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
