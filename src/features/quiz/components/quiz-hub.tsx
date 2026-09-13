"use client";

import React, { useState } from "react";
import { DailyChallengeCard } from "./daily-challenge-card";
import { QuizDeckCards } from "./quiz-deck-cards";
import { QuizRunnerModal } from "./quiz-runner-modal";
import type { QuizDeck } from "../types";
import { Award, Flame, Loader2, RefreshCw, BookOpen } from "lucide-react";
import { useDailyChallenge, useQuizDecks } from "../hooks/use-quiz";
import Link from "next/link";

export function QuizHub() {
  const [activeDeck, setActiveDeck] = useState<QuizDeck | null>(null);

  const { data: dailyData, isLoading: isDailyLoading, isError: isDailyError, refetch: refetchDaily } = useDailyChallenge();
  const { data: decksData, isLoading: isDecksLoading } = useQuizDecks();

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

        <div className="flex items-center gap-3">
          {totalMastery > 0 && (
            <>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 text-sm shadow-xs">
                <Flame className="h-4.5 w-4.5 text-amber-500" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{decks.length} Decks</span>
                <span className="text-zinc-400 text-xs">Available</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 text-sm shadow-xs">
                <Award className="h-4.5 w-4.5 text-primary" />
                <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalMastery}%</span>
                <span className="text-zinc-400 text-xs">Mastery</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Daily Challenge */}
      {isDailyLoading ? (
        <div className="h-48 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl animate-pulse" />
      ) : isDailyError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl">
          <p className="text-xs text-zinc-500">Could not load today&apos;s challenge</p>
          <button
            onClick={() => refetchDaily()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Retry
          </button>
        </div>
      ) : dailyData ? (
        <DailyChallengeCard question={dailyData} />
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
