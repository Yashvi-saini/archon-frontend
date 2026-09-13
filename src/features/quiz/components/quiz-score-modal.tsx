"use client";

import React from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { RadialScoreGauge } from "@/components/ui/svg-charts";
import type { QuizDeck } from "../types";

interface QuizScoreModalProps {
  deck: QuizDeck;
  selectedAnswers: Record<string, string>;
  onRetry: () => void;
  onExit: () => void;
}

export function QuizScoreModal({
  deck,
  selectedAnswers,
  onRetry,
  onExit,
}: QuizScoreModalProps) {
  let correctCount = 0;
  deck.questions.forEach((q) => {
    const selectedOptId = selectedAnswers[q.id];
    const correctOpt = q.options.find((o) => o.isCorrect);
    if (correctOpt && selectedOptId === correctOpt.id) {
      correctCount++;
    }
  });

  const totalQuestions = deck.questions.length;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const isPass = scorePercent >= 70;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <RadialScoreGauge
              value={scorePercent}
              size={120}
              strokeWidth={10}
              label="Score"
              sublabel={`${correctCount}/${totalQuestions} correct`}
              colorClassName={isPass ? "text-emerald-500" : "text-amber-500"}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {isPass ? "Excellent Architecture Comprehension!" : "Deck Complete — Review Recommended"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
              You answered {correctCount} out of {totalQuestions} questions correctly in {deck.title}.
            </p>
          </div>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
          {deck.questions.map((q, idx) => {
            const userAnsId = selectedAnswers[q.id];
            const correctOpt = q.options.find((o) => o.isCorrect);
            const userOpt = q.options.find((o) => o.id === userAnsId);
            const isUserCorrect = userOpt?.isCorrect;

            return (
              <div
                key={q.id}
                className="p-3.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/30 text-xs space-y-1.5"
              >
                <div className="flex items-start gap-2">
                  {isUserCorrect ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Q{idx + 1}. {q.question}
                  </span>
                </div>

                <div className="pl-6 text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1">
                  <p>
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Your choice:</span>{" "}
                    {userOpt ? userOpt.text : "Skipped"}
                  </p>
                  {!isUserCorrect && correctOpt && (
                    <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Correct: {correctOpt.text}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={onRetry}
            className="px-4 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Retry Deck
          </button>

          <button
            onClick={onExit}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-primary dark:hover:bg-primary/90 text-white text-xs font-semibold transition-all cursor-pointer shadow-xs hover:shadow-md"
          >
            Done & Return to Hub
          </button>
        </div>
      </div>
    </div>
  );
}
