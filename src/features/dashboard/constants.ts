import type {
  DashboardStats,
  RecommendedScenario,
  CompetencyMetric,
  RecentInterviewItem,
  RoadmapTopic,
} from "./types";

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  readinessScore: 78,
  readinessChange: 4.5,
  completedInterviews: 12,
  totalQuizzesTaken: 48,
  quizAccuracy: 84,
  streakDays: 6,
  scoreHistory: [62, 65, 70, 68, 74, 76, 78],
};

export const MOCK_RECOMMENDED_SCENARIO: RecommendedScenario = {
  id: "global-cdn",
  title: "Design a Global CDN & Edge Video Cache",
  desc: "Architect a multi-region edge caching layer supporting 50M concurrent video streams with adaptive bitrate transcoding and geo-DNS routing.",
  difficulty: "hard",
  estTime: "45 mins",
  topics: ["Geo-DNS", "Consistent Hashing", "Origin Shield", "HTTP/3", "Edge Caching"],
};

export const MOCK_COMPETENCIES: CompetencyMetric[] = [
  { label: "Scalability & Sharding", value: 84 },
  { label: "Storage & Schemas", value: 76 },
  { label: "Fault Tolerance", value: 68 },
  { label: "API & Protocols", value: 92 },
  { label: "Capacity Estimation", value: 74 },
];

export const MOCK_RECENT_INTERVIEWS: RecentInterviewItem[] = [
  {
    id: "int-1",
    sessionId: "7a2b9e11-401d-40aa-b921-12f86f7aa001",
    title: "WhatsApp Real-Time Messaging",
    difficulty: "hard",
    score: 82,
    status: "completed",
    date: "Yesterday",
    duration: "42 mins",
  },
  {
    id: "int-2",
    sessionId: "3f11c872-9b62-4214-a951-8a43923ee002",
    title: "Uber Geospatial Matching Broker",
    difficulty: "hard",
    score: 75,
    status: "completed",
    date: "3 days ago",
    duration: "38 mins",
  },
  {
    id: "int-3",
    sessionId: "8c91a723-5e3a-4428-9844-0bbf9134a003",
    title: "Distributed Cache with Consistent Hashing",
    difficulty: "medium",
    score: 88,
    status: "completed",
    date: "May 28",
    duration: "29 mins",
  },
  {
    id: "int-4",
    sessionId: "591fae29-2180-4993-a447-92084c8a2004",
    title: "Distributed Financial Ledger (Saga)",
    difficulty: "staff",
    score: 69,
    status: "completed",
    date: "May 25",
    duration: "45 mins",
  },
];

export const MOCK_ROADMAP: RoadmapTopic[] = [
  {
    id: "caching",
    title: "Distributed Caching & Invalidation",
    category: "Performance",
    completedLessons: 6,
    totalLessons: 6,
    mastery: 95,
    status: "completed",
  },
  {
    id: "partitioning",
    title: "Database Partitioning & Sharding",
    category: "Data Systems",
    completedLessons: 4,
    totalLessons: 5,
    mastery: 80,
    status: "in_progress",
  },
  {
    id: "queues",
    title: "Event Streaming & Message Queues",
    category: "Messaging",
    completedLessons: 3,
    totalLessons: 4,
    mastery: 72,
    status: "in_progress",
  },
  {
    id: "consensus",
    title: "Consensus Algorithms (Raft / Paxos)",
    category: "Reliability",
    completedLessons: 1,
    totalLessons: 4,
    mastery: 25,
    status: "in_progress",
  },
];
