"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ReportsList } from "./reports-list";
import { ReportDetail } from "./report-detail";
import { MOCK_REPORTS } from "../constants";
import type { DetailedReport } from "../types";
import { useInterviewReport } from "@/features/interview";
import { Loader2 } from "lucide-react";

export function ReportsView() {
  const searchParams = useSearchParams();
  const urlSessionId = searchParams.get("session_id");

  const [activeReportId, setActiveReportId] = useState<string | null>(null);

  const { data: liveData, isLoading: isLiveLoading } = useInterviewReport(
    urlSessionId || null
  );

  const selectedReport = useMemo<DetailedReport | null>(() => {
    if (activeReportId) {
      const match = MOCK_REPORTS.find((r) => r.id === activeReportId);
      if (match) return match;
    }

    if (urlSessionId) {
      const match = MOCK_REPORTS.find((r) => r.sessionId === urlSessionId);
      if (match) return match;

      if (liveData?.report) {
        const rep = liveData.report;
        return {
          id: rep.id || "rep-live",
          sessionId: urlSessionId,
          title: "Interview Session Evaluation",
          difficulty: "senior",
          overallScore: rep.score ?? 78,
          percentile: 82,
          duration: "40 mins",
          date: rep.started_at ? new Date(rep.started_at).toLocaleDateString() : "Recent",
          interviewerSummary:
            typeof rep.feedback === "string"
              ? rep.feedback
              : "Comprehensive automated architecture evaluation completed by AI bar-raiser.",
          rubrics: [
            {
              name: "Requirements & Scope",
              score: 85,
              weight: 20,
              summary: "Functional assumptions and scale constraints addressed.",
              feedbackPoints: ["Calculated storage and throughput estimates."],
            },
            {
              name: "High-Level Architecture",
              score: rep.score ?? 78,
              weight: 25,
              summary: "System decomposed into microservices and caches.",
              feedbackPoints: ["Component separation mapped cleanly."],
            },
            {
              name: "Data Modeling & Storage",
              score: 80,
              weight: 20,
              summary: "Storage schema and replication strategy evaluated.",
              feedbackPoints: ["Appropriate storage engines selected for read/write profiles."],
            },
            {
              name: "Scalability & Bottlenecks",
              score: 75,
              weight: 20,
              summary: "Identified failover mechanisms and cache policies.",
              feedbackPoints: ["Discussed scaling bottlenecks under peak traffic."],
            },
            {
              name: "Trade-offs & Articulation",
              score: 82,
              weight: 15,
              summary: "Clear justification of technology decisions.",
              feedbackPoints: ["Articulated CAP theorem trade-offs."],
            },
          ],
          strengths: [
            "Good architectural decomposition and component isolation.",
            "Structured response following clear interview framework.",
          ],
          weaknesses: [
            "Could detail specific failover scenarios and database replication lags.",
          ],
          recommendations: [
            "Practice back-of-the-envelope calculations for write-intensive workloads.",
          ],
          diagramComponents: ["API Gateway", "Application Cluster", "Redis Cache", "Database"],
        };
      }

      return MOCK_REPORTS[0];
    }

    return null;
  }, [activeReportId, urlSessionId, liveData]);

  if (urlSessionId && isLiveLoading) {
    return (
      <div className="p-16 text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-xs text-zinc-500">Fetching session evaluation...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      {!selectedReport && (
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Interview Reports & Audits
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Detailed scoring breakdowns, architectural trade-off evaluations, and AI feedback history.
          </p>
        </div>
      )}

      {selectedReport ? (
        <ReportDetail
          report={selectedReport}
          onBack={() => setActiveReportId(null)}
        />
      ) : (
        <ReportsList
          reports={MOCK_REPORTS}
          onSelectReport={(rep) => setActiveReportId(rep.id)}
        />
      )}
    </div>
  );
}
