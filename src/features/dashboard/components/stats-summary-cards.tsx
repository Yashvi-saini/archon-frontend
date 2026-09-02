"use client";

import React from "react";
import { Award, Flame, CheckCircle, HelpCircle, ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/ui/svg-charts";
import type { DashboardStats } from "../types";

interface StatsSummaryCardsProps {
  stats: DashboardStats;
}

export function StatsSummaryCards({ stats }: StatsSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Architecture Readiness</span>
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Award className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {stats.readinessScore}
            </span>
            <span className="text-xs text-zinc-400 font-medium"> / 100</span>
          </div>
          <Sparkline data={stats.scoreHistory} />
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="h-3.5 w-3.5" />
          <span>+{stats.readinessChange}% this month</span>
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Mock Interviews</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {stats.completedInterviews}
          </span>
          <span className="text-xs text-zinc-400 ml-1.5">sessions</span>
        </div>
        <p className="text-[11px] text-zinc-400">
          Evaluated against Senior / Staff rubrics
        </p>
      </div>

      <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Concept Quizzes</span>
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
            <HelpCircle className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              {stats.quizAccuracy}%
            </span>
            <span className="text-xs text-zinc-400 ml-1.5">accuracy</span>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {stats.totalQuizzesTaken} solved
          </span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.quizAccuracy}%` }}
          />
        </div>
      </div>

      <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Practice Streak</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div>
          <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            {stats.streakDays}
          </span>
          <span className="text-xs text-zinc-400 ml-1.5">consecutive days</span>
        </div>
        <p className="text-[11px] text-amber-600 dark:text-amber-400/90 font-medium">
          Target: 7 days weekly milestone
        </p>
      </div>
    </div>
  );
}
