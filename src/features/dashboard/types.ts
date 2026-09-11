export interface DashboardStats {
  readinessScore: number;
  readinessChange: number;
  completedInterviews: number;
  totalQuizzesTaken: number;
  quizAccuracy: number;
  streakDays: number;
  scoreHistory: number[];
}

export interface RecommendedScenario {
  id: string;
  title: string;
  desc: string;
  difficulty: "easy" | "medium" | "hard" | "staff";
  estTime: string;
  topics: string[];
}

export interface CompetencyMetric {
  label: string;
  value: number;
}

export interface RecentInterviewItem {
  id: string;
  sessionId: string;
  title: string;
  difficulty: "easy" | "medium" | "hard" | "staff";
  score: number | null;
  status: "completed" | "evaluating";
  date: string;
  duration: string;
}

export interface RoadmapTopic {
  id: string;
  title: string;
  category: string;
  completedLessons: number;
  totalLessons: number;
  mastery: number;
  status: "completed" | "in_progress" | "locked";
}

export interface DashboardOverviewData {
  stats: DashboardStats;
  recommendedScenario: RecommendedScenario | null;
  competencies: CompetencyMetric[];
  recentInterviews: RecentInterviewItem[];
  roadmap: RoadmapTopic[];
}
