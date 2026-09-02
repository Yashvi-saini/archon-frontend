"use client";

import React from "react";
import type { DomainMastery } from "../types";

interface DomainMasteryMatrixProps {
  domains: DomainMastery[];
}

export function DomainMasteryMatrix({ domains }: DomainMasteryMatrixProps) {
  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Domain Mastery Breakdown
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Your performance vs peer benchmark across fundamental distributed pillars
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-semibold text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" /> You
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-700 inline-block" /> Peer Benchmark
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {domains.map((dom) => (
          <div key={dom.domain} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {dom.domain}
              </span>
              <div className="flex items-center gap-2 font-mono">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {dom.score}%
                </span>
                <span className="text-[10px] text-zinc-400">
                  (peer: {dom.benchmark}%)
                </span>
              </div>
            </div>

            <div className="relative w-full bg-zinc-100 dark:bg-zinc-800/80 h-2 rounded-full overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-zinc-300/80 dark:bg-zinc-700 rounded-full"
                style={{ width: `${dom.benchmark}%` }}
              />
              <div
                className="relative top-0 bottom-0 bg-primary h-full rounded-full transition-all duration-700 opacity-90"
                style={{ width: `${dom.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
