"use client";

import React, { useState } from "react";
import { ReadinessIndexGauge } from "./readiness-index-gauge";
import { PerformanceTrendChart } from "./performance-trend-chart";
import { DomainMasteryMatrix } from "./domain-mastery-matrix";
import { ActivityHeatmap } from "./activity-heatmap";
import { PitfallInsights } from "./pitfall-insights";
import { MOCK_ANALYTICS } from "../constants";
import type { TimeRange } from "../types";

export function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            System Design Analytics & Telemetry
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Quantified architectural benchmarks, radar skills, and practice metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
            {(["7d", "30d", "90d", "all"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase transition-all cursor-pointer ${
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <ReadinessIndexGauge
            score={MOCK_ANALYTICS.readinessScore}
            percentile={MOCK_ANALYTICS.percentile}
            targetLevel={MOCK_ANALYTICS.targetLevel}
          />
        </div>
        <div className="lg:col-span-7">
          <PerformanceTrendChart data={MOCK_ANALYTICS.trend} />
        </div>
      </div>

      <DomainMasteryMatrix domains={MOCK_ANALYTICS.domainMastery} />

      <ActivityHeatmap days={MOCK_ANALYTICS.heatmapDays} />

      <PitfallInsights pitfalls={MOCK_ANALYTICS.pitfalls} />
    </div>
  );
}
