"use client";

import React, { useState } from "react";
import { DailyChallengeCard } from "./daily-challenge-card";
import { DailyStreakCalendar } from "./daily-streak-calendar";
import { QuizDeckCards } from "./quiz-deck-cards";
import { QuizRunnerModal } from "./quiz-runner-modal";
import type { QuizDeck } from "../types";
import { Award, Flame, Loader2, RefreshCw, BookOpen, Coins } from "lucide-react";
import { useDailyChallenge, useQuizDecks } from "../hooks/use-quiz";
import { useQuizRewards } from "../hooks/use-quiz-rewards";
import Link from "next/link";

export function QuizHub() {
  const [activeDeck, setActiveDeck] = useState<QuizDeck | null>(null);

  const { data: dailyData, isLoading: isDailyLoading, isError: isDailyError, refetch: refetchDaily } = useDailyChallenge();
  const { data: decksData, isLoading: isDecksLoading } = useQuizDecks();
  const { rewards } = useQuizRewards();

  const decks = decksData ?? [];

  const totalMastery =
    decks.length > 0
      ? Math.round(
          decks.reduce((acc, d) => acc + d.completedPercent, 0) / decks.length
        )
      : 0;

  return (
    <div className="max-w-[1550px] mx-auto w-full p-6 lg:p-8 xl:p-10 space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              System Design Quiz Trainer
            </h1>
            {(isDailyLoading || isDecksLoading) && (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            Rapid-fire concept verification across distributed algorithms, consistency models, and network paradigms.
          </p>
        </div>

        {/* LeetCode Style Header Pills: Streak, Coins & Mastery */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Daily Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 text-xs shadow-xs">
            <Flame className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{rewards.streakDays}</span>
            <span className="text-zinc-400 text-[11px]">{rewards.streakDays === 1 ? "Day Streak" : "Days Streak"}</span>
          </div>

          {/* Archon Coins */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 text-xs shadow-xs">
            <Coins className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{rewards.coins}</span>
            <span className="text-zinc-400 text-[11px]">Coins</span>
          </div>

          {/* Total Mastery */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 text-xs shadow-xs">
            <Award className="h-4 w-4 text-primary shrink-0" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalMastery}%</span>
            <span className="text-zinc-400 text-[11px]">Mastery</span>
          </div>
        </div>
      </div>

      {/* Daily Challenge & Activity Calendar */}
      {isDailyLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 xl:col-span-8 h-80 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl animate-pulse" />
          <div className="lg:col-span-5 xl:col-span-4 h-80 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl animate-pulse" />
        </div>
      ) : isDailyError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl">
          <p className="text-xs text-zinc-500">Could not load today&apos;s challenge</p>
          <button
            onClick={() => refetchDaily()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : dailyData ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          <div className="lg:col-span-8">
            <DailyChallengeCard question={dailyData} />
          </div>
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <DailyStreakCalendar />
          </div>
        </div>
      ) : null}

      {/* Deck Cards */}
      {isDecksLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-40 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full">
            <BookOpen className="h-8 w-8 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">No quiz decks available</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
              Quiz decks will appear here once the backend populates them. Check back soon.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Back to Dashboard
          </Link>
        </div>
      ) : (
        <QuizDeckCards decks={decks} onStartDeck={(deck) => setActiveDeck(deck)} />
      )}

      {activeDeck && (
        <QuizRunnerModal
          deck={activeDeck}
          onClose={() => setActiveDeck(null)}
        />
      )}
    </div>
  );
}
