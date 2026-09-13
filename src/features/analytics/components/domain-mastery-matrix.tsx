"use client";

import React, { useState } from "react";
import type { DomainMastery } from "../types";
import { 
  BarChart3, 
  Compass, 
  FileText, 
  Calculator, 
  Layers, 
  Cpu, 
  ArrowUpRight, 
  ArrowDownRight
} from "lucide-react";

interface DomainMasteryMatrixProps {
  domains: DomainMastery[];
}

const getDomainIcon = (domain: string) => {
  const d = domain.toLowerCase();
  if (d.includes("requirement") || d.includes("scope")) return FileText;
  if (d.includes("capacity") || d.includes("estimation")) return Calculator;
  if (d.includes("high-level") || d.includes("architecture")) return Layers;
  return Cpu;
};

export function DomainMasteryMatrix({ domains }: DomainMasteryMatrixProps) {
  const [viewMode, setViewMode] = useState<"bars" | "radar">("bars");
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  // Radar polygon calculation
  const radarSize = 240;
  const radarCenter = radarSize / 2;
  const radarRadius = 85;
  const numAxes = Math.max(domains.length, 4);

  const getCoordinates = (index: number, value: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = (value / 100) * radarRadius;
    const x = radarCenter + r * Math.cos(angle);
    const y = radarCenter + r * Math.sin(angle);
    return { x, y };
  };

  const userPoints = domains.map((d, i) => {
    const { x, y } = getCoordinates(i, Math.max(d.score, 3));
    return `${x},${y}`;
  }).join(" ");

  const benchmarkPoints = domains.map((d, i) => {
    const { x, y } = getCoordinates(i, d.benchmark);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-6">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Domain Mastery &amp; Architectural Pillars
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Comparative evaluation against Tier-1 engineering benchmarks across fundamental distributed systems tracks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Legend Pills */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#BA68C8]" /> You
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" /> Target Bar (75%)
            </span>
          </div>

          {/* View Mode Toggle Button Pills */}
          <div className="flex items-center p-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60">
            <button
              onClick={() => setViewMode("bars")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                viewMode === "bars"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="View Grouped Column Bar Chart"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Bar Chart</span>
            </button>
            <button
              onClick={() => setViewMode("radar")}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                viewMode === "radar"
                  ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-xs"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="View Radar Competency Polar Map"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Radar Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Visual Display */}
      {viewMode === "bars" ? (
        <div className="space-y-4 pt-2">
          <div className="relative">
            {/* Background Grid Lines with Scale Labels */}
            <div className="h-56 relative border-b border-zinc-200 dark:border-zinc-800">
              {/* Reference line: 100% */}
              <div className="absolute top-0 inset-x-0 border-t border-dashed border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400 pr-1 select-none pointer-events-none">
                <span className="font-mono">100%</span>
              </div>
              {/* Reference line: 75% (Target Bar) */}
              <div className="absolute top-[25%] inset-x-0 border-t border-dashed border-[#BA68C8]/40 dark:border-[#BA68C8]/30 flex items-center justify-between text-[10px] text-[#BA68C8] pr-1 select-none pointer-events-none z-10">
                <span className="font-mono bg-white dark:bg-[#111318] px-1 rounded">Benchmark: 75% Target</span>
              </div>
              {/* Reference line: 50% */}
              <div className="absolute top-[50%] inset-x-0 border-t border-dashed border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400 pr-1 select-none pointer-events-none">
                <span className="font-mono">50%</span>
              </div>
              {/* Reference line: 25% */}
              <div className="absolute top-[75%] inset-x-0 border-t border-dashed border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400 pr-1 select-none pointer-events-none">
                <span className="font-mono">25%</span>
              </div>

              {/* Grouped Columns Container */}
              <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-4 px-2 sm:px-6 items-end">
                {domains.map((dom) => {
                  const isHovered = hoveredDomain === dom.domain;
                  const barHeightUser = Math.max(dom.score, 3);
                  const barHeightPeer = dom.benchmark;

                  return (
                    <div
                      key={dom.domain}
                      onMouseEnter={() => setHoveredDomain(dom.domain)}
                      onMouseLeave={() => setHoveredDomain(null)}
                      className="h-full flex flex-col justify-end items-center group relative cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <div className="absolute -top-10 z-30 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 text-[11px] font-medium px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          {dom.domain}: {dom.score}% (Target: {dom.benchmark}%)
                        </div>
                      )}

                      {/* Side-by-side grouped bars */}
                      <div className="flex items-end justify-center gap-2 sm:gap-3 w-full max-w-[90px] h-[85%] pb-0.5">
                        {/* User Bar */}
                        <div className="flex-1 flex flex-col items-center h-full justify-end">
                          <span className={`text-[11px] font-bold font-mono transition-colors duration-200 mb-1 ${
                            isHovered ? "text-[#BA68C8]" : "text-zinc-700 dark:text-zinc-300"
                          }`}>
                            {dom.score}%
                          </span>
                          <div
                            className={`w-full rounded-t-md transition-all duration-700 ${
                              isHovered 
                                ? "bg-[#BA68C8] shadow-md shadow-[#BA68C8]/30" 
                                : "bg-gradient-to-t from-[#BA68C8]/70 to-[#BA68C8]"
                            }`}
                            style={{ height: `${barHeightUser}%` }}
                          />
                        </div>

                        {/* Benchmark Bar */}
                        <div className="flex-1 flex flex-col items-center h-full justify-end opacity-75">
                          <span className="text-[10px] font-mono text-zinc-400 mb-1">
                            {dom.benchmark}%
                          </span>
                          <div
                            className="w-full bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-t-md transition-all duration-700"
                            style={{ height: `${barHeightPeer}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column Footers: Title, Icon, & Delta Pill */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2 sm:px-6 pt-3">
              {domains.map((dom) => {
                const Icon = getDomainIcon(dom.domain);
                const delta = dom.score - dom.benchmark;
                const isAbove = delta >= 0;

                return (
                  <div key={dom.domain} className="flex flex-col items-center text-center space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[130px]" title={dom.domain}>
                        {dom.domain}
                      </span>
                    </div>

                    {/* LeetCode Styled Delta Pill */}
                    <div className="flex items-center">
                      {isAbove ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50">
                          <ArrowUpRight className="h-3 w-3 text-teal-500" />
                          <span>+{delta}% Bar Met</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50">
                          <ArrowDownRight className="h-3 w-3 text-amber-500" />
                          <span>{delta}% Gap</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Radar Polar Graph View */
        <div className="py-4 flex flex-col md:flex-row items-center justify-center gap-8">
          <div className="relative">
            <svg width={radarSize} height={radarSize} className="overflow-visible">
              {/* Concentric Reference Polygons (25%, 50%, 75%, 100%) */}
              {[25, 50, 75, 100].map((level) => {
                const points = domains.map((_, i) => {
                  const { x, y } = getCoordinates(i, level);
                  return `${x},${y}`;
                }).join(" ");

                return (
                  <polygon
                    key={level}
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    className={level === 75 ? "text-[#BA68C8]/40 stroke-dasharray-[2,2]" : "text-zinc-200 dark:text-zinc-800"}
                    strokeWidth="1"
                  />
                );
              })}

              {/* Axis lines from center */}
              {domains.map((_, i) => {
                const { x, y } = getCoordinates(i, 100);
                return (
                  <line
                    key={i}
                    x1={radarCenter}
                    y1={radarCenter}
                    x2={x}
                    y2={y}
                    stroke="currentColor"
                    className="text-zinc-200 dark:text-zinc-800"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Peer Benchmark Polygon */}
              <polygon
                points={benchmarkPoints}
                fill="currentColor"
                stroke="currentColor"
                className="text-zinc-300/30 dark:text-zinc-700/30 stroke-zinc-400 dark:stroke-zinc-600 stroke-dasharray-[3,3]"
                strokeWidth="1.5"
              />

              {/* User Score Polygon */}
              <polygon
                points={userPoints}
                fill="rgba(186, 104, 200, 0.25)"
                stroke="#BA68C8"
                strokeWidth="2.5"
                className="transition-all duration-700"
              />

              {/* User Data Points */}
              {domains.map((d, i) => {
                const { x, y } = getCoordinates(i, Math.max(d.score, 3));
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#BA68C8"
                    className="stroke-white dark:stroke-zinc-900 stroke-2"
                  />
                );
              })}
            </svg>
          </div>

          {/* Radar Legend and Summary */}
          <div className="space-y-3 max-w-xs w-full">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Pillar Evaluation Matrix
            </h4>
            <div className="space-y-2">
              {domains.map((dom) => {
                const Icon = getDomainIcon(dom.domain);
                const delta = dom.score - dom.benchmark;
                return (
                  <div key={dom.domain} className="flex items-center justify-between text-xs p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 text-[#BA68C8]" />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dom.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">{dom.score}%</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        delta >= 0 ? "text-teal-500 bg-teal-500/10" : "text-amber-500 bg-amber-500/10"
                      }`}>
                        {delta >= 0 ? `+${delta}%` : `${delta}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
