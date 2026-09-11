"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Network, ArrowRight, MessageSquare, Car, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStartInterview } from "@/features/interview/hooks/use-start-interview";
import { fetchInterviewQuestions } from "@/features/interview/api/interview";
import type { CreateInterviewRequest, Question } from "@/features/interview/types";

type DifficultyKey = "easy" | "medium" | "hard";

interface TopicCard {
  id: string;
  questionId?: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  difficulty: DifficultyKey;
  estTime: string;
  color: string;
  expectedTopics?: string[];
}

const FALLBACK_TOPICS: TopicCard[] = [
  {
    id: "whatsapp",
    title: "WhatsApp System Design",
    desc: "Design a real-time messaging pipeline to support 100M active daily users with instant delivery status and offline queuing.",
    icon: MessageSquare,
    difficulty: "hard",
    estTime: "45 mins",
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "uber",
    title: "Uber Ride Hailing",
    desc: "Design a high-throughput geospatial matching broker to match riders with nearby drivers under 2 seconds.",
    icon: Car,
    difficulty: "hard",
    estTime: "45 mins",
    color: "text-sky-500 bg-sky-500/10 border-sky-500/20",
  },
  {
    id: "netflix",
    title: "Netflix Video Streaming",
    desc: "Design a global content delivery network (CDN) and adaptive video transcoding pipeline for multi-bitrate playbacks.",
    icon: Video,
    difficulty: "medium",
    estTime: "40 mins",
    color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
  {
    id: "distributed-cache",
    title: "Distributed Cache",
    desc: "Design a distributed caching layer like Redis Cluster with consistent hashing, cache eviction policies, and replication.",
    icon: Network,
    difficulty: "easy",
    estTime: "30 mins",
    color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
  },
];

const difficultyLabel: Record<DifficultyKey, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const difficultyBadge: Record<DifficultyKey, string> = {
  easy: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
  medium: "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
  hard: "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800",
};

function normalizeDifficulty(raw: string): DifficultyKey {
  const d = raw.toLowerCase();
  if (d.includes("beginner") || d === "easy") return "easy";
  if (d.includes("intermediate") || d === "medium") return "medium";
  return "hard";
}

function questionToTopicCard(q: Question, index: number): TopicCard {
  const icons = [MessageSquare, Car, Video, Network];
  const colors = [
    "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    "text-sky-500 bg-sky-500/10 border-sky-500/20",
    "text-rose-500 bg-rose-500/10 border-rose-500/20",
    "text-violet-500 bg-violet-500/10 border-violet-500/20",
  ];
  const difficulty = normalizeDifficulty(q.difficulty);

  return {
    id: q.id,
    questionId: q.id,
    title: q.title,
    desc: q.expected_topics?.length
      ? `Focus areas: ${q.expected_topics.slice(0, 4).join(", ")}`
      : "System design interview scenario from the Archon question bank.",
    icon: icons[index % icons.length],
    difficulty,
    estTime: `${q.time_limit_minutes} mins`,
    color: colors[index % colors.length],
    expectedTopics: q.expected_topics,
  };
}

function buildInterviewUrl(sessionId: string, question: Question): string {
  const params = new URLSearchParams({
    title: question.title,
    timeLimit: String(question.time_limit_minutes),
  });
  if (question.expected_topics?.length) {
    params.set("topics", question.expected_topics.join(","));
  }
  return `/interview/${sessionId}?${params.toString()}`;
}

export default function InterviewsPage() {
  const router = useRouter();
  const [customTopic, setCustomTopic] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);

  const { mutateAsync: startInterview } = useStartInterview();

  const { data: backendQuestions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ["interview-questions"],
    queryFn: fetchInterviewQuestions,
    staleTime: 60_000,
  });

  const topics = useMemo<TopicCard[]>(() => {
    if (backendQuestions?.length) {
      return backendQuestions.map(questionToTopicCard);
    }
    return FALLBACK_TOPICS;
  }, [backendQuestions]);

  const handleStartPractice = async (topic: TopicCard) => {
    setStartingId(topic.id);
    try {
      const payload: CreateInterviewRequest = {
        difficulty: topic.difficulty,
        ...(topic.questionId ? { question_id: topic.questionId } : {}),
      };
      const result = await startInterview(payload);
      toast.success("Interview session started!");
      router.push(buildInterviewUrl(result.session_id, result.question));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start interview. Please try again.";
      toast.error(message);
    } finally {
      setStartingId(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) {
      toast.error("Please enter a custom scenario name");
      return;
    }
    setStartingId("custom");
    try {
      const payload: CreateInterviewRequest = { difficulty: "medium" };
      const result = await startInterview(payload);
      toast.success("Custom interview session started!");
      const question = {
        ...result.question,
        title: customTopic.trim(),
      };
      router.push(buildInterviewUrl(result.session_id, question));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start interview. Please try again.";
      toast.error(message);
    } finally {
      setStartingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-205">
      <div>
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">Interviews</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Select a distributed systems problem to enter the interactive design whiteboard workspace.
          {isLoadingQuestions && (
            <span className="ml-2 inline-flex items-center gap-1 text-zinc-400">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading questions...
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {topics.map((topic) => {
          const Icon = topic.icon;
          const isLoading = startingId === topic.id;
          return (
            <div
              key={topic.id}
              className="flex flex-col justify-between p-6 bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-primary/55 group transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg border ${topic.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex gap-1.5">
                    <span
                      className={`px-2 py-0.5 border text-3xs font-bold rounded-md ${difficultyBadge[topic.difficulty]}`}
                    >
                      {difficultyLabel[topic.difficulty]}
                    </span>
                    <span className="px-2 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-3xs font-bold rounded-md text-zinc-400">
                      {topic.estTime}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-primary transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-1.5 leading-relaxed">
                    {topic.desc}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleStartPractice(topic)}
                disabled={!!startingId}
                className="w-full mt-6 inline-flex items-center justify-center gap-1.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-bold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    Start Practice <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl space-y-4">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400">Custom Scenario</h2>
          <p className="text-xs text-zinc-450 dark:text-zinc-500 mt-0.5">
            Define your own architecture scenario and start practicing immediately.
          </p>
        </div>

        <form onSubmit={handleCustomSubmit} className="flex gap-3">
          <input
            type="text"
            placeholder="e.g. Design a Distributed Web Crawler"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
          />
          <button
            type="submit"
            disabled={!!startingId}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900 font-bold text-xs rounded-lg transition-colors cursor-pointer flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
          >
            {startingId === "custom" ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Starting...
              </>
            ) : (
              "Launch Custom"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
