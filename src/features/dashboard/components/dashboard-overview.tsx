"use client";

import React from "react";
import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { StatsSummaryCards } from "./stats-summary-cards";
import { RecommendedScenarioHero } from "./recommended-scenario-hero";
import { CompetencyRadarCard } from "./competency-radar";
import { RecentInterviewsList } from "./recent-interviews-list";
import { TopicRoadmapCard } from "./topic-roadmap";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_RECOMMENDED_SCENARIO,
  MOCK_COMPETENCIES,
  MOCK_RECENT_INTERVIEWS,
  MOCK_ROADMAP,
} from "../constants";

export function DashboardOverview() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Architecture Dashboard
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Active Candidate
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            System design interview readiness, practice metrics, and AI evaluations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#111318] text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Quick Quiz
          </Link>
          <Link
            href="/interviews"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-xs font-bold text-white dark:text-zinc-900 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Start Interview
          </Link>
        </div>
      </div>

      <StatsSummaryCards stats={MOCK_DASHBOARD_STATS} />

      <RecommendedScenarioHero scenario={MOCK_RECOMMENDED_SCENARIO} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompetencyRadarCard metrics={MOCK_COMPETENCIES} />
        <RecentInterviewsList interviews={MOCK_RECENT_INTERVIEWS} />
      </div>

      <TopicRoadmapCard topics={MOCK_ROADMAP} />
    </div>
  );
}
