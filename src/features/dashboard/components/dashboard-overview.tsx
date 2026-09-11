"use client";

import React from "react";
import Link from "next/link";
import { Plus, Sparkles, Loader2, RefreshCw, LayoutDashboard } from "lucide-react";
import { StatsSummaryCards } from "./stats-summary-cards";
import { RecommendedScenarioHero } from "./recommended-scenario-hero";
import { CompetencyRadarCard } from "./competency-radar";
import { RecentInterviewsList } from "./recent-interviews-list";
import { TopicRoadmapCard } from "./topic-roadmap";
import { useDashboardOverview } from "../hooks/use-dashboard-overview";

export function DashboardOverview() {
  const { data, isLoading, isError, refetch } = useDashboardOverview();

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            Architecture Dashboard
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            Active Candidate
          </span>
          {isLoading && (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
          )}
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
  );

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
        {header}
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-3 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="h-3 w-28 bg-zinc-100 dark:bg-zinc-800 rounded" />
                <div className="h-7 w-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
              </div>
              <div className="h-8 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-36 bg-zinc-100 dark:bg-zinc-800 rounded" />
            </div>
          ))}
        </div>
        {/* Hero skeleton */}
        <div className="h-44 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl animate-pulse" />
        {/* Bottom grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl animate-pulse" />
          <div className="h-72 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
        {header}
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-full">
            <RefreshCw className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Failed to load dashboard
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Could not connect to the Archon backend. Make sure the API server is running.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = data!.stats;
  const recommendedScenario = data!.recommendedScenario;
  const competencies = data!.competencies;
  const recentInterviews = data!.recentInterviews;
  const roadmap = data!.roadmap;

  const isEmpty =
    stats.completedInterviews === 0 &&
    stats.totalQuizzesTaken === 0 &&
    recentInterviews.length === 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      {header}

      <StatsSummaryCards stats={stats} />

      {recommendedScenario ? (
        <RecommendedScenarioHero scenario={recommendedScenario} />
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#111318] p-8 text-center">
          <LayoutDashboard className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No recommended scenario yet</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            Complete your first interview to receive a personalized next challenge recommendation.
          </p>
          <Link
            href="/interviews"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Start Your First Interview
          </Link>
        </div>
      )}

      {isEmpty ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-8 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No competency data yet</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Your radar chart will populate after your first graded interview session.
            </p>
          </div>
          <div className="p-8 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl text-center space-y-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No interview history</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Recent mock interviews and AI grades will appear here after your first session.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompetencyRadarCard metrics={competencies} />
          <RecentInterviewsList interviews={recentInterviews} />
        </div>
      )}

      {roadmap.length > 0 && <TopicRoadmapCard topics={roadmap} />}
    </div>
  );
}
