"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import type { RecommendedScenario } from "../types";

interface RecommendedScenarioHeroProps {
  scenario: RecommendedScenario;
}

export function RecommendedScenarioHero({ scenario }: RecommendedScenarioHeroProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#111318] p-7 lg:p-8 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Recommended Mock
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
              <Clock className="h-3 w-3 text-zinc-400" /> {scenario.estTime}
            </span>
            <span className="px-3 py-1 text-xs font-medium uppercase tracking-wide rounded-full bg-zinc-100 dark:bg-zinc-800 text-rose-600 dark:text-rose-400 border border-zinc-200/50 dark:border-zinc-700/50">
              {scenario.difficulty}
            </span>
          </div>

          <div>
            <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {scenario.title}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
              {scenario.desc}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {scenario.topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-0.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2.5 shrink-0">
          <Link
            href="/interviews"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-sm font-bold transition-all shadow-xs hover:shadow-sm"
          >
            Launch Mock Workspace <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-xs text-zinc-400 text-center md:text-right">
            Whiteboard + AI Interviewer ready
          </span>
        </div>
      </div>
    </div>
  );
}
