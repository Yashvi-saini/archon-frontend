"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { RadialScoreGauge } from "@/components/ui/svg-charts";
import { ScoreBreakdownCard } from "./score-breakdown-card";
import { FeedbackTimeline } from "./feedback-timeline";
import type { DetailedReport } from "../types";

interface ReportDetailProps {
  report: DetailedReport;
  onBack?: () => void;
}

export function ReportDetail({ report, onBack }: ReportDetailProps) {
  const isPass = report.overallScore >= 75;

  return (
    <div className="space-y-6">
      <div>
        {onBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to All Reports
          </button>
        ) : (
          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to All Reports
          </Link>
        )}
      </div>

      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 ${
                isPass
                  ? "text-teal-600 dark:text-teal-400"
                  : "text-amber-600 dark:text-amber-400"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> {isPass ? "Passed Senior Bar" : "Revision Suggested"}
            </span>
            <span className="text-xs uppercase px-2.5 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 font-medium">
              {report.difficulty}
            </span>
            <span className="text-xs text-zinc-400">
              ID: {report.sessionId.slice(0, 8)}...
            </span>
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {report.title}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              {report.interviewerSummary}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {report.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {report.duration}
            </span>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center justify-center gap-4 p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/60">
          <RadialScoreGauge
            value={report.overallScore}
            size={110}
            strokeWidth={9}
            label="Overall"
            sublabel={report.percentile >= 50 ? `Top ${100 - report.percentile}%` : report.percentile > 0 ? `${report.percentile}th percentile` : "Score / 100"}
            colorClassName={isPass ? "text-emerald-500" : report.overallScore >= 40 ? "text-amber-500" : "text-[#BA68C8]"}
          />
          <div className="text-center">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
              Peer Standing
            </span>
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              {report.percentile >= 50 ? `Top ${100 - report.percentile}% of candidates` : report.percentile > 0 ? `${report.percentile}th percentile` : "Baseline session"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ScoreBreakdownCard rubrics={report.rubrics} />
        </div>
        <div className="lg:col-span-5">
          <FeedbackTimeline
            strengths={report.strengths}
            weaknesses={report.weaknesses}
            recommendations={report.recommendations}
            diagramComponents={report.diagramComponents}
          />
        </div>
      </div>
    </div>
  );
}
