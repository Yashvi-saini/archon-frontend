"use client";

import React, { useState } from "react";
import { 
  Search, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Bot, 
  Award, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sparkles
} from "lucide-react";
import type { DetailedReport } from "../types";

interface ReportsListProps {
  reports: DetailedReport[];
  onSelectReport: (report: DetailedReport) => void;
}

function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "Recent Session";
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayDuration(durStr?: string): string {
  if (!durStr || durStr === "-") return "25 mins";
  const numMatch = durStr.match(/\d+/);
  if (!numMatch) return durStr;
  const mins = parseInt(numMatch[0], 10);
  if (mins > 180) return "Extended Session";
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
  }
  return `${mins} mins`;
}

function getDifficultyBadgeColor(diff: string) {
  const d = diff.toLowerCase();
  if (d === "staff" || d === "principal") {
    return "text-purple-600 dark:text-purple-400";
  }
  if (d === "senior" || d === "hard") {
    return "text-rose-600 dark:text-rose-400";
  }
  if (d === "intermediate" || d === "medium") {
    return "text-amber-600 dark:text-amber-400";
  }
  return "text-teal-600 dark:text-teal-400";
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

  const bestReport = reports.find((r) => r.overallScore === highestScore);

  // Dynamic status evaluation based on actual average score
  const getAvgScoreStatus = () => {
    if (avgScore >= 80) {
      return {
        text: "Exceeds Senior Engineering bar",
        color: "text-teal-600 dark:text-teal-400",
      };
    }
    if (avgScore >= 65) {
      return {
        text: "Meets Senior Engineering target",
        color: "text-teal-600 dark:text-teal-400",
      };
    }
    if (avgScore >= 45) {
      return {
        text: "Approaching Intermediate bar",
        color: "text-amber-600 dark:text-amber-400",
      };
    }
    if (avgScore > 0) {
      return {
        text: "Calibration & practice in progress",
        color: "text-rose-600 dark:text-rose-400",
      };
    }
    return {
      text: "No graded evaluations yet",
      color: "text-zinc-400",
    };
  };

  const avgStatus = getAvgScoreStatus();

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Sessions */}
        <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Evaluated Sessions
            </span>
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {reports.length}
            </p>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">
              Architectural audits on record
            </span>
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Average Evaluation
            </span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                {avgScore}
              </p>
              <span className="text-xs text-zinc-400 font-medium">/ 100</span>
            </div>
            <span className={`text-[11px] font-medium mt-0.5 block ${avgStatus.color}`}>
              {avgStatus.text}
            </span>
          </div>
        </div>

        {/* Card 3: Personal Best */}
        <div className="p-5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Personal Best
            </span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl lg:text-3xl font-bold text-primary">
                {highestScore}
              </p>
              <span className="text-xs text-zinc-400 font-medium">/ 100</span>
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block truncate max-w-[220px]">
              {bestReport && highestScore > 0 ? bestReport.title : "No high score recorded"}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report by problem title or system keyword..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-foreground placeholder:text-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-primary/40"
          />
        </div>

        {/* LeetCode Styled Difficulty Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["all", "beginner", "intermediate", "senior", "staff"].map((diff) => {
            const isActive = selectedDifficulty === diff;
            return (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 text-xs font-medium rounded-full capitalize transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs font-semibold"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 border border-zinc-200/50 dark:border-zinc-700/50"
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      {/* Redesigned Report Cards List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-[#111318]">
            <p className="text-xs text-zinc-400">No reports matched your search filters.</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const isHigh = report.overallScore >= 75;
            const isMid = report.overallScore >= 50 && report.overallScore < 75;
            const badgeColor = isHigh
              ? "text-teal-600 dark:text-teal-400"
              : isMid
              ? "text-amber-600 dark:text-amber-400"
              : "text-rose-600 dark:text-rose-400";

            const diffColor = getDifficultyBadgeColor(report.difficulty);
            const displayDate = formatDisplayDate(report.date);
            const displayDuration = formatDisplayDuration(report.duration);

            const statusText = isHigh 
              ? "Target Bar Cleared" 
              : isMid 
              ? "Approaching Target Bar" 
              : "Revision Recommended";

            return (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-5 sm:p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Left Side: Metadata, Title, and Bar-Raiser Audit Box */}
                <div className="space-y-3 flex-1 min-w-0">
                  {/* Top Metadata Capsules */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Difficulty Capsule */}
                    <span className={`text-xs uppercase px-2.5 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-100 dark:bg-zinc-800 font-medium ${diffColor}`}>
                      {report.difficulty}
                    </span>

                    {/* Clean Formatted Date Capsule */}
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
                      <Calendar className="h-3 w-3 text-zinc-400" />
                      <span>{displayDate}</span>
                    </span>

                    {/* Clean Formatted Duration Capsule */}
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      <span>{displayDuration}</span>
                    </span>

                    {/* Rubric Axes Indicator */}
                    {report.rubrics && report.rubrics.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                        · {report.rubrics.length} rubric axes audited
                      </span>
                    )}
                  </div>

                  {/* Problem Title */}
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors tracking-tight">
                    {report.title}
                  </h3>

                  {/* AI Bar-Raiser Evaluation Callout Box */}
                  <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/60 dark:border-zinc-800/80 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      <Bot className="h-3.5 w-3.5 text-primary" />
                      <span>Bar-Raiser Executive Audit</span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed font-medium">
                      {report.interviewerSummary || "Architectural rubric assessment and topological breakdown logged for this session."}
                    </p>
                  </div>
                </div>

                {/* Right Side: Score, Status & Navigation Chevron */}
                <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800/60">
                  <div className="text-left md:text-right space-y-1">
                    {/* LeetCode Styled Score Capsule */}
                    <div>
                      <span className={`inline-block text-xs font-bold font-mono px-3.5 py-1 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 bg-zinc-100 dark:bg-zinc-800 ${badgeColor}`}>
                        {report.overallScore} / 100
                      </span>
                    </div>

                    {/* Dynamic Status Text */}
                    <span className="block text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                      {statusText}
                    </span>

                    {/* Dynamic Percentile Standing */}
                    <span className="block text-[10px] font-mono text-zinc-400">
                      {report.percentile >= 50
                        ? `Top ${Math.max(1, 100 - report.percentile)}% of candidates`
                        : report.percentile > 0
                        ? `${report.percentile}th percentile`
                        : "Baseline session"}
                    </span>
                  </div>

                  {/* Circular Chevron Action Button */}
                  <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                    <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
