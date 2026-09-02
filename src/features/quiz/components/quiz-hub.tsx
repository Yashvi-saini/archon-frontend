"use client";

import React, { useState } from "react";
import { DailyChallengeCard } from "./daily-challenge-card";
import { QuizDeckCards } from "./quiz-deck-cards";
import { QuizRunnerModal } from "./quiz-runner-modal";
import { DAILY_CHALLENGE_QUESTION, MOCK_QUIZ_DECKS } from "../constants";
import type { QuizDeck } from "../types";
import { Award, Flame, Loader2 } from "lucide-react";
import { useDailyChallenge, useQuizDecks } from "../hooks/use-quiz";

export function QuizHub() {
  const [activeDeck, setActiveDeck] = useState<QuizDeck | null>(null);

  const { data: dailyData, isLoading: isDailyLoading } = useDailyChallenge();
  const { data: decksData, isLoading: isDecksLoading } = useQuizDecks();

  const dailyQuestion = dailyData ?? DAILY_CHALLENGE_QUESTION;
  const decks = decksData ?? MOCK_QUIZ_DECKS;

  const totalMastery =
    decks.length > 0
      ? Math.round(
          decks.reduce((acc, d) => acc + d.completedPercent, 0) / decks.length
        )
      : 80;

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
              System Design Quiz Trainer
            </h1>
            {(isDailyLoading || isDecksLoading) && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Rapid-fire concept verification across distributed algorithms, consistency models, and network paradigms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 text-xs shadow-xs">
            <Flame className="h-4 w-4 text-amber-500" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100">6 Days</span>
            <span className="text-zinc-400 text-[11px]">Quiz Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 text-xs shadow-xs">
            <Award className="h-4 w-4 text-primary" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100">{totalMastery}%</span>
            <span className="text-zinc-400 text-[11px]">Mastery</span>
          </div>
        </div>
      </div>

      <DailyChallengeCard question={dailyQuestion} />

      <QuizDeckCards
        decks={decks}
        onStartDeck={(deck) => setActiveDeck(deck)}
      />

      {activeDeck && (
        <QuizRunnerModal
          deck={activeDeck}
          onClose={() => setActiveDeck(null)}
        />
      )}
    </div>
  );
}
