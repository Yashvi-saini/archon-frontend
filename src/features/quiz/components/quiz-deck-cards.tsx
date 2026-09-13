"use client";

import React from "react";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Database, 
  Users, 
  Cpu, 
  Clock, 
  HelpCircle, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import type { QuizDeck } from "../types";

interface QuizDeckCardsProps {
  decks: QuizDeck[];
  onStartDeck: (deck: QuizDeck) => void;
}

function getDifficultyTextColor(diff: string) {
  const d = diff.toLowerCase();
  if (d === "staff" || d === "principal") {
    return "text-purple-600 dark:text-purple-400";
  }
  if (d === "senior" || d === "hard") {
    return "text-rose-600 dark:text-rose-400";
  }
  if (d === "intermediate" || d === "medium") {
    return "text-amber-600 dark:text-amber-400";
  }
  return "text-teal-600 dark:text-teal-400";
}

function getDomainTheme(deck: QuizDeck) {
  const t = deck.title.toLowerCase();
  if (t.includes("cap") || t.includes("consistency")) {
    return {
      icon: Shield,
      iconColor: "text-sky-500 dark:text-sky-400",
    };
  }
  if (t.includes("cach")) {
    return {
      icon: Zap,
      iconColor: "text-amber-500 dark:text-amber-400",
    };
  }
  if (t.includes("storage") || t.includes("key-value")) {
    return {
      icon: Database,
      iconColor: "text-purple-500 dark:text-purple-400",
    };
  }
  if (t.includes("social") || t.includes("fanout") || t.includes("feed")) {
    return {
      icon: Users,
      iconColor: "text-rose-500 dark:text-rose-400",
    };
  }
  return {
    icon: Cpu,
    iconColor: "text-teal-500 dark:text-teal-400",
  };
}

function getTopicTags(deck: QuizDeck): string[] {
  const t = deck.title.toLowerCase();
  if (t.includes("cap") || t.includes("consistency")) {
    return ["PACELC", "Quorum", "CP vs AP"];
  }
  if (t.includes("cach")) {
    return ["Cache-Aside", "Stampede", "Redis Cluster"];
  }
  if (t.includes("storage") || t.includes("key-value")) {
    return ["Consistent Hashing", "Vector Clocks", "LSM Tree"];
  }
  if (t.includes("social") || t.includes("fanout") || t.includes("feed")) {
    return ["Fanout-on-Write", "Timeline Cache", "Celebrity Mitigations"];
  }
  return [deck.category || "Distributed Systems"];
}

export function QuizDeckCards({ decks, onStartDeck }: QuizDeckCardsProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            System Design Topic Decks
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Targeted problem sets for rapid concept retention and interview drill-downs
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>{decks.length} Active Decks</span>
        </div>
      </div>

      {/* 3 in a row on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {decks.map((deck) => {
          const { icon: Icon, iconColor } = getDomainTheme(deck);
          const diffTextColor = getDifficultyTextColor(deck.difficulty);
          const tags = getTopicTags(deck);
          const isMastered = deck.completedPercent >= 100;
          const isStarted = deck.completedPercent > 0;

          return (
            <div
              key={deck.id}
              className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl shadow-xs hover:shadow-md flex flex-col justify-between space-y-5 group transition-all duration-200"
            >
              {/* Card Top: Icon & LeetCode Styled Badges */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className={`p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 ${iconColor} shadow-xs`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* LeetCode Styled Difficulty Capsule */}
                    <span className={`px-2.5 py-0.5 text-xs font-medium uppercase rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 ${diffTextColor}`}>
                      {deck.difficulty}
                    </span>

                    {/* Clean Duration Capsule */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 rounded-full">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      <span>{deck.estMinutes} mins</span>
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
                    {deck.description}
                  </p>
                </div>

                {/* LeetCode Styled Syllabus Capsule Pills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Bottom: Questions count, Mastery progress & Action Button */}
              <div className="space-y-3.5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                {/* Status Row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium">
                    <HelpCircle className="h-3.5 w-3.5 text-zinc-400" />
                    {deck.questionCount} Questions
                  </span>

                  {isMastered ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-teal-600 dark:text-teal-400">
                      <CheckCircle2 className="h-3 w-3" /> 100% Mastered
                    </span>
                  ) : isStarted ? (
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-amber-600 dark:text-amber-400">
                      {deck.completedPercent}% Mastered
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-500 dark:text-zinc-400">
                      Not Started
                    </span>
                  )}
                </div>

                {/* Smooth Progress Bar */}
                <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isMastered 
                        ? "bg-teal-500" 
                        : isStarted 
                        ? "bg-linear-to-r from-primary to-violet-500" 
                        : "bg-transparent"
                    }`}
                    style={{ width: `${Math.max(deck.completedPercent, 0)}%` }}
                  />
                </div>

                {/* Sleek Dark-Mode-First Action Button */}
                <button
                  onClick={() => onStartDeck(deck)}
                  className="w-full py-2.5 px-4 bg-zinc-100 dark:bg-zinc-800/90 hover:bg-zinc-900 hover:text-white dark:hover:bg-primary dark:hover:text-white text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/60 font-semibold text-xs rounded-xl transition-all duration-200 cursor-pointer inline-flex items-center justify-center gap-2 group/btn shadow-xs hover:shadow-md hover:border-transparent"
                >
                  <span>Launch Quiz Deck</span>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-transform duration-200" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
