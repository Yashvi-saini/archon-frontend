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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Architecture Readiness */}
      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Architecture Readiness
          </span>
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Award className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {stats.readinessScore}
            </span>
            <span className="text-sm text-zinc-400 font-semibold"> / 100</span>
          </div>
          <Sparkline data={stats.scoreHistory} />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {stats.readinessChange > 0 ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              <span>+{stats.readinessChange}% this month</span>
            </span>
          ) : stats.readinessChange < 0 ? (
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <span>{stats.readinessChange}% this month</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 font-normal">
              <span>Baseline calibration</span>
            </span>
          )}
        </div>
      </div>

      {/* Card 2: Mock Interviews */}
      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Mock Interviews
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
        <div>
          <span className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {stats.completedInterviews}
          </span>
          <span className="text-sm text-zinc-400 font-medium ml-2">sessions</span>
        </div>
        <p className="text-xs text-zinc-400">
          Evaluated against Senior / Staff rubrics
        </p>
      </div>

      {/* Card 3: Concept Quizzes */}
      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Concept Quizzes
          </span>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
            <HelpCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {stats.quizAccuracy}%
            </span>
            <span className="text-sm text-zinc-400 font-medium ml-2">accuracy</span>
          </div>
          <span className="text-xs font-mono font-medium text-zinc-400">
            {stats.totalQuizzesTaken} solved
          </span>
        </div>
        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-sky-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.quizAccuracy}%` }}
          />
        </div>
      </div>

      {/* Card 4: Practice Streak */}
      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Practice Streak
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Flame className="h-5 w-5" />
          </div>
        </div>
        <div>
          <span className="text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {stats.streakDays}
          </span>
          <span className="text-sm text-zinc-400 font-medium ml-2">consecutive days</span>
        </div>
        <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
          Target: 7 days weekly milestone
        </p>
      </div>
    </div>
  );
}
