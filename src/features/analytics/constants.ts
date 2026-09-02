import type { OverallAnalytics, HeatmapDay } from "./types";

const generateHeatmap = (): HeatmapDay[] => {
  const days: HeatmapDay[] = [];
  const today = new Date();
  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay();
    let count = 0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      count = (i % 3 === 0) ? 2 : (i % 5 === 0) ? 1 : 0;
    } else {
      count = (i % 2 === 0) ? 1 : (i % 4 === 0) ? 3 : (i % 7 === 0) ? 2 : 0;
    }
    days.push({
      date: d.toISOString().split("T")[0],
      count,
    });
  }
  return days;
};

export const MOCK_ANALYTICS: OverallAnalytics = {
  readinessScore: 81,
  percentile: 88,
  totalHoursTrained: 18.5,
  avgScore: 78,
  targetLevel: "Senior Software Engineer (L5 / SDE-III)",
  trend: [
    { label: "Apr 1", value: 58 },
    { label: "Apr 8", value: 63 },
    { label: "Apr 15", value: 65 },
    { label: "Apr 22", value: 72 },
    { label: "Apr 29", value: 70 },
    { label: "May 6", value: 75 },
    { label: "May 13", value: 78 },
    { label: "May 20", value: 84 },
    { label: "May 27", value: 81 },
  ],
  domainMastery: [
    { domain: "Distributed Caching & Invalidation", score: 92, questionsCount: 8, benchmark: 74 },
    { domain: "Load Balancing & Reverse Proxies", score: 88, questionsCount: 6, benchmark: 76 },
    { domain: "Database Sharding & Replication", score: 82, questionsCount: 9, benchmark: 68 },
    { domain: "Message Queues & Event Streaming", score: 78, questionsCount: 7, benchmark: 65 },
    { domain: "Geospatial Indexing (H3 / S2 / Quad)", score: 68, questionsCount: 4, benchmark: 59 },
    { domain: "Consensus Protocols (Raft / Paxos)", score: 62, questionsCount: 5, benchmark: 54 },
  ],
  heatmapDays: generateHeatmap(),
  pitfalls: [
    {
      id: "pit-1",
      category: "warning",
      title: "Write-heavy Hotspotting in Partition Keys",
      description: "In 2 recent sessions, shard keys were based on timestamp or non-hashed IDs without salting, causing unbuffered sequential write hotspots.",
      impact: "High",
      frequency: "2 times (Uber, WhatsApp)",
    },
    {
      id: "pit-2",
      category: "critical",
      title: "Missing Dead-Letter Queues (DLQ) in Kafka",
      description: "Asynchronous retry loops did not specify exponential backoffs or poisoned message isolation to DLQs.",
      impact: "Critical",
      frequency: "3 times",
    },
    {
      id: "pit-3",
      category: "tip",
      title: "Back-of-the-Envelope Bandwidth Units",
      description: "Remember to distinguish Megabits per second (network egress) from Megabytes per second (disk throughput) during capacity estimation.",
      impact: "Medium",
      frequency: "General Habit",
    },
  ],
};
