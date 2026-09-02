import { apiClient, ApiError } from "@/lib/api-client";
import type { OverallAnalytics, TimeRange } from "../types";
import { MOCK_ANALYTICS } from "../constants";

interface RawAnalyticsResponse {
  readiness_score?: number;
  readinessScore?: number;
  percentile?: number;
  total_hours_trained?: number;
  totalHoursTrained?: number;
  avg_score?: number;
  avgScore?: number;
  target_level?: string;
  targetLevel?: string;
  trend?: Array<{ label: string; value: number }>;
  domain_mastery?: Array<{
    domain: string;
    score: number;
    benchmark: number;
    questions_count?: number;
    questionsCount?: number;
  }>;
  domainMastery?: Array<{
    domain: string;
    score: number;
    benchmark: number;
    questions_count?: number;
    questionsCount?: number;
  }>;
  heatmap_days?: Array<{ date: string; count: number }>;
  heatmapDays?: Array<{ date: string; count: number }>;
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
  try {
    const raw = await apiClient.get<RawAnalyticsResponse>(`/api/v1/analytics?range=${range}`);

    const rawMastery = raw.domain_mastery || raw.domainMastery;
    const rawHeatmap = raw.heatmap_days || raw.heatmapDays;

    return {
      readinessScore: raw.readiness_score ?? raw.readinessScore ?? MOCK_ANALYTICS.readinessScore,
      percentile: raw.percentile ?? MOCK_ANALYTICS.percentile,
      totalHoursTrained: raw.total_hours_trained ?? raw.totalHoursTrained ?? MOCK_ANALYTICS.totalHoursTrained,
      avgScore: raw.avg_score ?? raw.avgScore ?? MOCK_ANALYTICS.avgScore,
      targetLevel: raw.target_level ?? raw.targetLevel ?? MOCK_ANALYTICS.targetLevel,
      trend: raw.trend && raw.trend.length > 0 ? raw.trend : MOCK_ANALYTICS.trend,
      domainMastery:
        rawMastery && rawMastery.length > 0
          ? rawMastery.map((m) => ({
              domain: m.domain,
              score: m.score,
              benchmark: m.benchmark,
              questionsCount: m.questions_count ?? m.questionsCount ?? 5,
            }))
          : MOCK_ANALYTICS.domainMastery,
      heatmapDays:
        rawHeatmap && rawHeatmap.length > 0
          ? rawHeatmap
          : MOCK_ANALYTICS.heatmapDays,
      pitfalls:
        raw.pitfalls && raw.pitfalls.length > 0
          ? raw.pitfalls
          : MOCK_ANALYTICS.pitfalls,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      throw err;
    }
    return MOCK_ANALYTICS;
  }
}
