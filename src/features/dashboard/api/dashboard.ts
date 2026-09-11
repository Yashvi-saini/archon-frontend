import { apiClient, ApiError } from "@/lib/api-client";
import type { DashboardOverviewData } from "../types";

interface RawDashboardOverview {
  stats?: {
    readiness_score?: number;
    readiness_change?: number;
    completed_interviews?: number;
    total_quizzes_taken?: number;
    quiz_accuracy?: number;
    streak_days?: number;
    score_history?: number[];
  };
  recommended_scenario?: {
    id: string;
    title: string;
    desc: string;
    difficulty: "easy" | "medium" | "hard" | "staff";
    est_time?: string;
    topics: string[];
  };
  competencies?: { label: string; value: number }[];
  recent_interviews?: Array<{
    id: string;
    session_id?: string;
    title: string;
    difficulty: "easy" | "medium" | "hard" | "staff";
    score: number | null;
    status: "completed" | "evaluating";
    date: string;
    duration: string;
  }>;
  roadmap?: Array<{
    id: string;
    title: string;
    category: string;
    completed_lessons?: number;
    total_lessons?: number;
    mastery: number;
    status: "completed" | "in_progress" | "locked";
  }>;
}

export async function fetchDashboardOverview(): Promise<DashboardOverviewData> {
  const raw = await apiClient.get<RawDashboardOverview>("/api/v1/dashboard/overview");

  const rawStats = raw.stats;
  const rawScenario = raw.recommended_scenario;
  const rawInterviews = raw.recent_interviews;
  const rawRoadmap = raw.roadmap;

  return {
    stats: {
      readinessScore: rawStats?.readiness_score ?? 0,
      readinessChange: rawStats?.readiness_change ?? 0,
      completedInterviews: rawStats?.completed_interviews ?? 0,
      totalQuizzesTaken: rawStats?.total_quizzes_taken ?? 0,
      quizAccuracy: rawStats?.quiz_accuracy ?? 0,
      streakDays: rawStats?.streak_days ?? 0,
      scoreHistory: rawStats?.score_history ?? [],
    },

    recommendedScenario: rawScenario
      ? {
          id: rawScenario.id,
          title: rawScenario.title,
          desc: rawScenario.desc,
          difficulty: rawScenario.difficulty,
          estTime: rawScenario.est_time ?? "45 mins",
          topics: rawScenario.topics ?? [],
        }
      : null,

    competencies: rawScenario && raw.competencies && raw.competencies.length > 0
      ? raw.competencies
      : [],

    recentInterviews: rawInterviews && rawInterviews.length > 0
      ? rawInterviews.map((item) => ({
          id: item.id,
          sessionId: item.session_id ?? item.id,
          title: item.title,
          difficulty: item.difficulty,
          score: item.score,
          status: item.status,
          date: item.date,
          duration: item.duration,
        }))
      : [],

    roadmap: rawRoadmap && rawRoadmap.length > 0
      ? rawRoadmap.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          completedLessons: item.completed_lessons ?? 0,
          totalLessons: item.total_lessons ?? 0,
          mastery: item.mastery,
          status: item.status,
        }))
      : [],
  };
}
