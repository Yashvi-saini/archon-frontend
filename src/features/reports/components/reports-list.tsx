"use client";

import React, { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import type { DetailedReport } from "../types";

interface ReportsListProps {
  reports: DetailedReport[];
  onSelectReport: (report: DetailedReport) => void;
}

export function ReportsList({ reports, onSelectReport }: ReportsListProps) {
  const [search, setSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.title.toLowerCase().includes(search.toLowerCase()) ||
      rep.interviewerSummary.toLowerCase().includes(search.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === "all" || rep.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const avgScore =
    reports.length > 0
      ? Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / reports.length)
      : 0;

  const highestScore =
    reports.length > 0
      ? Math.max(...reports.map((r) => r.overallScore))
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <span className="text-xs text-zinc-400 font-medium">Evaluated Sessions</span>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
            {reports.length}
          </p>
          <span className="text-[11px] text-zinc-400">Total mock interviews logged</span>
        </div>

        <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <span className="text-xs text-zinc-400 font-medium">Average Evaluation</span>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{avgScore}</p>
            <span className="text-xs text-zinc-400">/ 100</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Meets Senior Engineering target
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs">
          <span className="text-xs text-zinc-400 font-medium">Personal Best</span>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-2xl font-bold text-primary">{highestScore}</p>
            <span className="text-xs text-zinc-400">/ 100</span>
          </div>
          <span className="text-[11px] text-zinc-400">Distributed Cache session</span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report by problem title or system keyword..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-foreground placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-primary/40"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "beginner", "intermediate", "senior", "staff"].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors cursor-pointer shrink-0 ${
                selectedDifficulty === diff
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#111318]">
            <p className="text-xs text-zinc-400">No reports matched your search filters.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isHigh = report.overallScore >= 80;
            const isMid = report.overallScore >= 70 && report.overallScore < 80;
            const badgeColor = isHigh
              ? "text-teal-600 dark:text-teal-400"
              : isMid
              ? "text-amber-600 dark:text-amber-400"
              : "text-rose-600 dark:text-rose-400";

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs hover:border-primary/50 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase px-2.5 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 font-medium">
                      {report.difficulty}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {report.date}
                    </span>
                    <span className="text-xs text-zinc-400">
                      • {report.duration}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                    {report.interviewerSummary}
                  </p>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0">
                  <div className="text-right">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-100 dark:bg-zinc-800 inline-block ${badgeColor}`}>
                      {report.overallScore} / 100
                    </span>
                    <span className="block text-[10px] text-zinc-400 mt-1">
                      {report.percentile}th percentile
                    </span>
                  </div>

                  <ChevronRight className="h-5 w-5 text-zinc-300 dark:text-zinc-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
