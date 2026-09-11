"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ReportsList } from "./reports-list";
import { ReportDetail } from "./report-detail";
import type { DetailedReport } from "../types";
import { useReportsList, useReportDetail } from "../hooks/use-reports";
import { Loader2, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";

export function ReportsView() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("session_id");

  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const targetId = activeReportId || urlSessionId || null;

  const { data: listData, isLoading: isListLoading, isError: isListError, refetch } = useReportsList();
  const { data: detailData, isLoading: isDetailLoading } = useReportDetail(targetId);

  const reports = listData?.reports ?? [];

  const selectedReport = useMemo<DetailedReport | null>(() => {
    if (detailData && detailData.status === "done") {
      return detailData.report;
    }

    if (targetId) {
      const match = reports.find((r) => r.id === targetId || r.sessionId === targetId);
      if (match) return match;
    }

    return null;
  }, [detailData, targetId, reports]);

  const isEvaluating = detailData && detailData.status === "evaluating";

  if (targetId && (isDetailLoading || isEvaluating)) {
    return (
      <div className="p-16 text-center space-y-4 animate-in fade-in">
        <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto text-primary">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {isEvaluating ? "AI Bar-Raiser is Evaluating Your Architecture" : "Retrieving Detailed Evaluation"}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {isEvaluating
              ? "Your whiteboard nodes and interview transcript are currently being scored against FAANG rubrics. This updates automatically."
              : "Fetching multi-axis rubrics, feedback timeline, and topology analysis."}
          </p>
        </div>
        <button
          onClick={() => setActiveReportId(null)}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1550px] mx-auto w-full p-6 lg:p-8 xl:p-10 space-y-8 animate-in fade-in duration-200">
      {!selectedReport && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Interview Reports &amp; Audits
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Detailed scoring breakdowns, architectural trade-off evaluations, and AI feedback history.
            </p>
          </div>
          {isListLoading && <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />}
        </div>
      )}

      {isListLoading && !selectedReport && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {isListError && !selectedReport && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-full">
            <RefreshCw className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Failed to load reports</h3>
            <p className="text-xs text-zinc-500 mt-1">Could not reach the reports endpoint. Please try again.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      )}

      {!isListLoading && !isListError && reports.length === 0 && !selectedReport && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full">
            <FileText className="h-8 w-8 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No interview reports yet</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              Complete an interview session and get it evaluated by the AI Bar-Raiser to see detailed reports here.
            </p>
          </div>
          <Link
            href="/interviews"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold transition-colors"
          >
            Start an Interview
          </Link>
        </div>
      )}

      {selectedReport ? (
        <ReportDetail
          report={selectedReport}
          onBack={() => setActiveReportId(null)}
        />
      ) : (
        !isListLoading && !isListError && reports.length > 0 && (
          <ReportsList
            reports={reports}
            onSelectReport={(rep) => setActiveReportId(rep.id)}
          />
        )
      )}
    </div>
  );
}
