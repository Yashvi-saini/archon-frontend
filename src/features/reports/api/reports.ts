import { apiClient } from "@/lib/api-client";
import type { DetailedReport, ReportDifficulty, ReportsListResult, RubricCategory } from "../types";

interface RawRubric {
  name: string;
  score: number;
  weight: number;
  summary: string;
  feedback_points?: string[];
}

interface RawDetailedReport {
  id?: string;
  session_id?: string;
  title: string;
  difficulty: string;
  overall_score?: number;
  percentile?: number;
  duration?: string;
  date?: string;
  started_at?: string;
  interviewer_summary?: string;
  rubrics?: RawRubric[];
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  diagram_components?: string[];
  status?: string;
}

interface RawReportsListResponse {
  summary?: {
    total_reports?: number;
    average_score?: number;
    highest_score?: number;
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
    feedbackPoints: r.feedback_points ?? [],
  }));
}

export function normalizeReport(raw: RawDetailedReport): DetailedReport {
  const sessionId = raw.session_id ?? raw.id ?? "unknown";
  return {
    id: raw.id ?? sessionId,
    sessionId,
    title: raw.title || "System Design Evaluation",
    difficulty: (raw.difficulty?.toLowerCase() ?? "senior") as ReportDifficulty,
    overallScore: raw.overall_score ?? 0,
    percentile: raw.percentile ?? 0,
    duration: raw.duration || "-",
    date: raw.date ?? (raw.started_at ? new Date(raw.started_at).toLocaleDateString() : ""),
    interviewerSummary: raw.interviewer_summary ?? "",
    rubrics: normalizeRubrics(raw.rubrics),
    strengths: raw.strengths ?? [],
    weaknesses: raw.weaknesses ?? [],
    recommendations: raw.recommendations ?? [],
    diagramComponents: raw.diagram_components ?? [],
  };
}

export async function fetchReportsList(params?: {
  search?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}): Promise<ReportsListResult> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.difficulty && params.difficulty !== "all") query.set("difficulty", params.difficulty);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const qs = query.toString();
  const endpoint = `/api/v1/reports${qs ? `?${qs}` : ""}`;

  const raw = await apiClient.get<RawReportsListResponse>(endpoint);

  const reports = raw.reports && raw.reports.length > 0
    ? raw.reports.map(normalizeReport)
    : [];

  return {
    summary: {
      totalReports: raw.summary?.total_reports ?? reports.length,
      averageScore: raw.summary?.average_score ?? 0,
      highestScore: raw.summary?.highest_score ?? 0,
    },
    reports,
  };
}

export type ReportDetailResult =
  | { status: "evaluating" }
  | { status: "done"; report: DetailedReport };

export async function fetchReportDetail(sessionId: string): Promise<ReportDetailResult> {
  const raw = await apiClient.get<RawDetailedReport | { status: string }>(
    `/api/v1/reports/${sessionId}`
  );

  if ("status" in raw && raw.status === "evaluating") {
    return { status: "evaluating" };
  }

  const report = normalizeReport(raw as RawDetailedReport);
  return { status: "done", report };
}
