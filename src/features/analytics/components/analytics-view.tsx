"use client";

import React, { useState } from "react";
import { ReadinessIndexGauge } from "./readiness-index-gauge";
import { PerformanceTrendChart } from "./performance-trend-chart";
import { DomainMasteryMatrix } from "./domain-mastery-matrix";
import { ActivityHeatmap } from "./activity-heatmap";
import { PitfallInsights } from "./pitfall-insights";
import type { TimeRange } from "../types";
import { useAnalytics } from "../hooks/use-analytics";
import { Loader2, RefreshCw, BarChart3 } from "lucide-react";

export function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { data, isLoading, isError, refetch } = useAnalytics(timeRange);

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            System Design Analytics &amp; Telemetry
          </h1>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          )}
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
          Quantified architectural benchmarks, radar skills, and practice metrics.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
          {(["7d", "30d", "90d", "all"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                timeRange === range
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-[1550px] mx-auto w-full p-6 lg:p-8 xl:p-10 space-y-8 animate-in fade-in duration-200">
        {header}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 h-80 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl animate-pulse" />
          <div className="lg:col-span-7 h-80 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl animate-pulse" />
        </div>
        <div className="h-64 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl animate-pulse" />
        <div className="h-48 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-[1550px] mx-auto w-full p-6 lg:p-8 xl:p-10 space-y-8 animate-in fade-in duration-200">
        {header}
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-full">
            <RefreshCw className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Failed to load analytics</h3>
            <p className="text-xs text-zinc-500 mt-1">Could not reach the analytics endpoint. Please try again.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const analytics = data!;
  const hasData = analytics.avgScore > 0 || analytics.trend.length > 0 || analytics.domainMastery.length > 0;

  if (!hasData) {
    return (
      <div className="max-w-[1550px] mx-auto w-full p-6 lg:p-8 xl:p-10 space-y-8 animate-in fade-in duration-200">
        {header}
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full">
            <BarChart3 className="h-8 w-8 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No analytics data yet</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Complete your first interview or quiz session to start generating performance telemetry.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1550px] mx-auto w-full p-6 lg:p-8 xl:p-10 space-y-8 animate-in fade-in duration-200">
      {header}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <ReadinessIndexGauge
            score={analytics.readinessScore}
            percentile={analytics.percentile}
            targetLevel={analytics.targetLevel}
          />
        </div>
        <div className="lg:col-span-7">
          <PerformanceTrendChart data={analytics.trend} />
        </div>
      </div>

      {analytics.domainMastery.length > 0 && (
        <DomainMasteryMatrix domains={analytics.domainMastery} />
      )}

      {analytics.heatmapDays.length > 0 && (
        <ActivityHeatmap days={analytics.heatmapDays} />
      )}

      {analytics.pitfalls && analytics.pitfalls.length > 0 && (
        <PitfallInsights pitfalls={analytics.pitfalls} />
      )}
    </div>
  );
}
