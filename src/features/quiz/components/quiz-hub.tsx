"use client";

import React, { useState } from "react";
import { DailyChallengeCard } from "./daily-challenge-card";
import { QuizDeckCards } from "./quiz-deck-cards";
import { QuizRunnerModal } from "./quiz-runner-modal";
import { DAILY_CHALLENGE_QUESTION, MOCK_QUIZ_DECKS } from "../constants";
import type { QuizDeck } from "../types";
import { Award, Flame } from "lucide-react";

export function QuizHub() {
  const [activeDeck, setActiveDeck] = useState<QuizDeck | null>(null);

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
            System Design Quiz Trainer
          </h1>
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
            <span className="font-bold text-zinc-900 dark:text-zinc-100">84%</span>
            <span className="text-zinc-400 text-[11px]">Mastery</span>
          </div>
        </div>
      </div>

      <DailyChallengeCard question={DAILY_CHALLENGE_QUESTION} />

      <QuizDeckCards
        decks={MOCK_QUIZ_DECKS}
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
