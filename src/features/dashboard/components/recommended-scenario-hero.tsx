"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import type { RecommendedScenario } from "../types";

interface RecommendedScenarioHeroProps {
  scenario: RecommendedScenario;
}

export function RecommendedScenarioHero({ scenario }: RecommendedScenarioHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#111318] p-6 shadow-xs">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3 w-3" /> Recommended Next Mock
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              <Clock className="h-3 w-3" /> {scenario.estTime}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
              {scenario.difficulty}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {scenario.title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {scenario.desc}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {scenario.topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 shrink-0">
          <Link
            href="/interviews"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-colors shadow-xs"
          >
            Launch Mock Workspace <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <span className="text-[11px] text-zinc-400 text-center md:text-right">
            Whiteboard + AI Interviewer ready
          </span>
        </div>
      </div>
    </div>
  );
}
