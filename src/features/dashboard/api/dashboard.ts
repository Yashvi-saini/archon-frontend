import { apiClient, ApiError } from "@/lib/api-client";
import type { DashboardOverviewData } from "../types";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_RECOMMENDED_SCENARIO,
  MOCK_COMPETENCIES,
  MOCK_RECENT_INTERVIEWS,
  MOCK_ROADMAP,
} from "../constants";

interface RawDashboardOverview {
  stats?: {
    readiness_score?: number;
    readinessScore?: number;
    readiness_change?: number;
    readinessChange?: number;
    completed_interviews?: number;
    completedInterviews?: number;
    total_quizzes_taken?: number;
    totalQuizzesTaken?: number;
    quiz_accuracy?: number;
    quizAccuracy?: number;
    streak_days?: number;
    streakDays?: number;
    score_history?: number[];
    scoreHistory?: number[];
  };
  recommended_scenario?: {
    id: string;
    title: string;
    desc: string;
    difficulty: "easy" | "medium" | "hard" | "staff";
    est_time?: string;
    estTime?: string;
    topics: string[];
  };
  recommendedScenario?: {
    id: string;
    title: string;
    desc: string;
    difficulty: "easy" | "medium" | "hard" | "staff";
    est_time?: string;
    estTime?: string;
    topics: string[];
  };
  competencies?: { label: string; value: number }[];
  recent_interviews?: Array<{
    id: string;
    session_id?: string;
    sessionId?: string;
    title: string;
    difficulty: "easy" | "medium" | "hard" | "staff";
    score: number | null;
    status: "completed" | "evaluating";
    date: string;
    duration: string;
  }>;
  recentInterviews?: Array<{
    id: string;
    session_id?: string;
    sessionId?: string;
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
    completedLessons?: number;
    total_lessons?: number;
    totalLessons?: number;
    mastery: number;
    status: "completed" | "in_progress" | "locked";
  }>;
}

export async function fetchDashboardOverview(): Promise<DashboardOverviewData> {
  try {
    const raw = await apiClient.get<RawDashboardOverview>("/api/v1/dashboard/overview");

    const rawStats = raw.stats;
    const rawScenario = raw.recommended_scenario || raw.recommendedScenario;
    const rawInterviews = raw.recent_interviews || raw.recentInterviews;
    const rawRoadmap = raw.roadmap;

    return {
      stats: rawStats
        ? {
            readinessScore: rawStats.readiness_score ?? rawStats.readinessScore ?? MOCK_DASHBOARD_STATS.readinessScore,
            readinessChange: rawStats.readiness_change ?? rawStats.readinessChange ?? MOCK_DASHBOARD_STATS.readinessChange,
            completedInterviews: rawStats.completed_interviews ?? rawStats.completedInterviews ?? MOCK_DASHBOARD_STATS.completedInterviews,
            totalQuizzesTaken: rawStats.total_quizzes_taken ?? rawStats.totalQuizzesTaken ?? MOCK_DASHBOARD_STATS.totalQuizzesTaken,
            quizAccuracy: rawStats.quiz_accuracy ?? rawStats.quizAccuracy ?? MOCK_DASHBOARD_STATS.quizAccuracy,
            streakDays: rawStats.streak_days ?? rawStats.streakDays ?? MOCK_DASHBOARD_STATS.streakDays,
            scoreHistory: rawStats.score_history ?? rawStats.scoreHistory ?? MOCK_DASHBOARD_STATS.scoreHistory,
          }
        : MOCK_DASHBOARD_STATS,

      recommendedScenario: rawScenario
        ? {
            id: rawScenario.id,
            title: rawScenario.title,
            desc: rawScenario.desc,
            difficulty: rawScenario.difficulty,
            estTime: rawScenario.est_time ?? rawScenario.estTime ?? MOCK_RECOMMENDED_SCENARIO.estTime,
            topics: rawScenario.topics,
          }
        : MOCK_RECOMMENDED_SCENARIO,

      competencies:
        raw.competencies && raw.competencies.length > 0
          ? raw.competencies
          : MOCK_COMPETENCIES,

      recentInterviews:
        rawInterviews && rawInterviews.length > 0
          ? rawInterviews.map((item) => ({
              id: item.id,
              sessionId: item.session_id ?? item.sessionId ?? item.id,
              title: item.title,
              difficulty: item.difficulty,
              score: item.score,
              status: item.status,
              date: item.date,
              duration: item.duration,
            }))
          : MOCK_RECENT_INTERVIEWS,

      roadmap:
        rawRoadmap && rawRoadmap.length > 0
          ? rawRoadmap.map((item) => ({
              id: item.id,
              title: item.title,
              category: item.category,
              completedLessons: item.completed_lessons ?? item.completedLessons ?? 0,
              totalLessons: item.total_lessons ?? item.totalLessons ?? 0,
              mastery: item.mastery,
              status: item.status,
            }))
          : MOCK_ROADMAP,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      throw err;
    }
    return {
      stats: MOCK_DASHBOARD_STATS,
      recommendedScenario: MOCK_RECOMMENDED_SCENARIO,
      competencies: MOCK_COMPETENCIES,
      recentInterviews: MOCK_RECENT_INTERVIEWS,
      roadmap: MOCK_ROADMAP,
    };
  }
}
