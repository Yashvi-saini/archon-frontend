export type TimeRange = "7d" | "30d" | "90d" | "all";

export interface AnalyticsTrendPoint {
  label: string;
  value: number;
}

export interface DomainMastery {
  domain: string;
  score: number; // 0 - 100
  questionsCount: number;
  benchmark: number; // Average score of peers
}

export interface HeatmapDay {
  date: string;
  count: number; // 0, 1, 2, 3+
}

export interface PitfallInsight {
  id: string;
  category: "critical" | "warning" | "tip";
  title: string;
  description: string;
  impact: string;
  frequency: string;
}

export interface OverallAnalytics {
  readinessScore: number;
  percentile: number;
  totalHoursTrained: number;
  avgScore: number;
  targetLevel: string;
  trend: AnalyticsTrendPoint[];
  domainMastery: DomainMastery[];
  heatmapDays: HeatmapDay[];
  pitfalls: PitfallInsight[];
}
