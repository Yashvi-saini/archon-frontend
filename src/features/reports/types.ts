export type ReportDifficulty = "beginner" | "intermediate" | "senior" | "staff";

export interface RubricCategory {
  name: string;
  score: number;
  weight: number;
  summary: string;
  feedbackPoints: string[];
}

export interface DetailedReport {
  id: string;
  sessionId: string;
  title: string;
  difficulty: ReportDifficulty;
  overallScore: number;
  percentile: number;
  duration: string;
  date: string;
  interviewerSummary: string;
  rubrics: RubricCategory[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  diagramComponents: string[];
}

export interface ReportsSummary {
  totalReports: number;
  averageScore: number;
  highestScore: number;
}

export interface ReportsListResult {
  summary: ReportsSummary;
  reports: DetailedReport[];
}

export interface ReportFilter {
  search: string;
  difficulty: string;
  scoreRange: "all" | "high" | "medium" | "low";
}
