import { apiClient } from "@/lib/api-client";
import type { DetailedReport, ReportDifficulty, ReportsListResult, RubricCategory } from "../types";
import { MOCK_REPORTS } from "../constants";

interface RawRubric {
  name: string;
  score: number;
  weight: number;
  summary: string;
  feedback_points?: string[];
  feedbackPoints?: string[];
}

interface RawDetailedReport {
  id?: string;
  session_id?: string;
  sessionId?: string;
  title: string;
  difficulty: string;
  overall_score?: number;
  overallScore?: number;
  percentile?: number;
  duration?: string;
  date?: string;
  started_at?: string;
  ended_at?: string;
  interviewer_summary?: string;
  interviewerSummary?: string;
  rubrics?: RawRubric[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  diagram_components?: string[];
  diagramComponents?: string[];
  status?: string;
}

interface RawReportsListResponse {
  summary?: {
    total_reports?: number;
    totalReports?: number;
    average_score?: number;
    averageScore?: number;
    highest_score?: number;
    highestScore?: number;
  };
  reports?: RawDetailedReport[];
}

function normalizeRubrics(rawRubrics?: RawRubric[]): RubricCategory[] {
  if (!rawRubrics || rawRubrics.length === 0) return [];
  return rawRubrics.map((r) => ({
    name: r.name,
    score: r.score,
    weight: r.weight,
    summary: r.summary,
    feedbackPoints: r.feedback_points ?? r.feedbackPoints ?? [],
  }));
}

export function normalizeReport(raw: RawDetailedReport): DetailedReport {
  const sessionId = raw.session_id ?? raw.sessionId ?? raw.id ?? "rep-unknown";
  return {
    id: raw.id ?? sessionId,
    sessionId,
    title: raw.title || "System Design Evaluation",
    difficulty: (raw.difficulty?.toLowerCase() ?? "senior") as ReportDifficulty,
    overallScore: raw.overall_score ?? raw.overallScore ?? 75,
    percentile: raw.percentile ?? 80,
    duration: raw.duration || "45 mins",
    date: raw.date ?? (raw.started_at ? new Date(raw.started_at).toLocaleDateString() : "Recent"),
    interviewerSummary: raw.interviewer_summary ?? raw.interviewerSummary ?? "",
    rubrics: normalizeRubrics(raw.rubrics),
    strengths: raw.strengths ?? [],
    weaknesses: raw.weaknesses ?? [],
    recommendations: raw.recommendations ?? [],
    diagramComponents: raw.diagram_components ?? raw.diagramComponents ?? [],
  };
}

export async function fetchReportsList(params?: {
  search?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}): Promise<ReportsListResult> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.difficulty && params.difficulty !== "all") query.set("difficulty", params.difficulty);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    const endpoint = `/api/v1/reports${qs ? `?${qs}` : ""}`;

    const raw = await apiClient.get<RawReportsListResponse>(endpoint);

    const rawReports = raw.reports;
    const reports =
      rawReports && rawReports.length > 0
        ? rawReports.map(normalizeReport)
        : MOCK_REPORTS;

    const total = raw.summary?.total_reports ?? raw.summary?.totalReports ?? reports.length;
    const avg =
      raw.summary?.average_score ??
      raw.summary?.averageScore ??
      Math.round(reports.reduce((acc, r) => acc + r.overallScore, 0) / (reports.length || 1));
    const highest =
      raw.summary?.highest_score ??
      raw.summary?.highestScore ??
      Math.max(...reports.map((r) => r.overallScore));

    return {
      summary: {
        totalReports: total,
        averageScore: avg,
        highestScore: highest,
      },
      reports,
    };
  } catch {
    return {
      summary: {
        totalReports: MOCK_REPORTS.length,
        averageScore: 78,
        highestScore: 88,
      },
      reports: MOCK_REPORTS,
    };
  }
}

export type ReportDetailResult =
  | { status: "evaluating" }
  | { status: "done"; report: DetailedReport };

export async function fetchReportDetail(sessionId: string): Promise<ReportDetailResult> {
  try {
    const raw = await apiClient.get<RawDetailedReport | { status: string }>(`/api/v1/reports/${sessionId}`);

    if ("status" in raw && raw.status === "evaluating") {
      return { status: "evaluating" };
    }

    const report = normalizeReport(raw as RawDetailedReport);
    return { status: "done", report };
  } catch {
    const fallback = MOCK_REPORTS.find((r) => r.id === sessionId || r.sessionId === sessionId) || MOCK_REPORTS[0];
    return { status: "done", report: fallback };
  }
}
