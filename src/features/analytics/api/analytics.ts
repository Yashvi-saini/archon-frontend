import { apiClient } from "@/lib/api-client";
import type { OverallAnalytics, TimeRange } from "../types";

interface RawAnalyticsResponse {
  readiness_score?: number;
  percentile?: number;
  total_hours_trained?: number;
  avg_score?: number;
  target_level?: string;
  trend?: Array<{ label: string; value: number }>;
  domain_mastery?: Array<{
    domain: string;
    score: number;
    benchmark: number;
    questions_count?: number;
  }>;
  heatmap_days?: Array<{ date: string; count: number }>;
  pitfalls?: Array<{
    id: string;
    category: "critical" | "warning" | "tip";
    title: string;
    description: string;
    impact: string;
    frequency: string;
  }>;
}

export async function fetchAnalytics(range: TimeRange = "30d"): Promise<OverallAnalytics> {
  const raw = await apiClient.get<RawAnalyticsResponse>(`/api/v1/analytics?range=${range}`);

  return {
    readinessScore: raw.readiness_score ?? 0,
    percentile: raw.percentile ?? 0,
    totalHoursTrained: raw.total_hours_trained ?? 0,
    avgScore: raw.avg_score ?? 0,
    targetLevel: raw.target_level ?? "",
    trend: raw.trend ?? [],
    domainMastery: raw.domain_mastery
      ? raw.domain_mastery.map((m) => ({
          domain: m.domain,
          score: m.score,
          benchmark: m.benchmark,
          questionsCount: m.questions_count ?? 0,
        }))
      : [],
    heatmapDays: raw.heatmap_days ?? [],
    pitfalls: raw.pitfalls ?? [],
  };
}
