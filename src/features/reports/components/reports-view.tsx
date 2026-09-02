"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ReportsList } from "./reports-list";
import { ReportDetail } from "./report-detail";
import { MOCK_REPORTS } from "../constants";
import type { DetailedReport } from "../types";
import { useReportsList, useReportDetail } from "../hooks/use-reports";
import { Loader2, RefreshCw } from "lucide-react";

export function ReportsView() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("session_id");

  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const targetId = activeReportId || urlSessionId || null;

  const { data: listData, isLoading: isListLoading } = useReportsList();
  const { data: detailData, isLoading: isDetailLoading } = useReportDetail(targetId);

  const reports = listData?.reports ?? MOCK_REPORTS;

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
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      {!selectedReport && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Interview Reports & Audits
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Detailed scoring breakdowns, architectural trade-off evaluations, and AI feedback history.
            </p>
          </div>
          {isListLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          )}
        </div>
      )}

      {selectedReport ? (
        <ReportDetail
          report={selectedReport}
          onBack={() => setActiveReportId(null)}
        />
      ) : (
        <ReportsList
          reports={reports}
          onSelectReport={(rep) => setActiveReportId(rep.id)}
        />
      )}
    </div>
  );
}
