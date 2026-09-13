"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, HelpCircle, ArrowRight, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { QuizScoreModal } from "./quiz-score-modal";
import type { QuizDeck } from "../types";
import { useQuizDeckQuestions, useSubmitQuizDeck } from "../hooks/use-quiz";

interface QuizRunnerModalProps {
  deck: QuizDeck;
  onClose: () => void;
}

export function QuizRunnerModal({ deck, onClose }: QuizRunnerModalProps) {
  const { data: deckQuestions, isLoading: isQuestionsLoading } = useQuizDeckQuestions(deck.id);
  const submitMutation = useSubmitQuizDeck();

  const questions =
    deckQuestions && deckQuestions.length > 0 ? deckQuestions : deck.questions;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const currentSelectedOptId = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;

  const handleSelectOption = (optId: string) => {
    if (showExplanation) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optId,
    }));
  };

  const handleVerify = () => {
    if (!currentSelectedOptId) return;
    setShowExplanation(true);
  };

  const handleNext = async () => {
    setShowExplanation(false);
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      submitMutation.mutate({
        deckId: deck.id,
        payload: {
          time_spent_seconds: elapsedSeconds,
          answers: selectedAnswers,
        },
      });
    }
  };

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setIsCompleted(false);
    setElapsedSeconds(0);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? "0" : ""}${remainder}`;
  };

  if (isCompleted) {
    return (
      <QuizScoreModal
        deck={{ ...deck, questions }}
        selectedAnswers={selectedAnswers}
        onRetry={handleRetry}
        onExit={onClose}
      />
    );
  }

  if (isQuestionsLoading || !currentQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-8 text-center space-y-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-xs text-zinc-400">Loading quiz scenario questions...</p>
        </div>
      </div>
    );
  }

  const selectedOpt = currentQuestion.options.find((o) => o.id === currentSelectedOptId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 relative">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3.5">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block truncate max-w-[260px]">
              {deck.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200/50 dark:border-zinc-700/50">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-primary to-violet-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-medium capitalize rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-300">
              {currentQuestion.topicTag}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
            {currentQuestion.question}
          </h3>
          {currentQuestion.scenario && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 leading-relaxed font-normal">
              {currentQuestion.scenario}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentSelectedOptId === opt.id;
            const isCorrect = showExplanation && opt.isCorrect;
            const isWrongSelection = showExplanation && isSelected && !opt.isCorrect;

            let cardStyle =
              "border-zinc-200 dark:border-zinc-800 hover:border-primary/50 bg-white dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300";

            if (isSelected && !showExplanation) {
              cardStyle = "border-primary bg-white dark:bg-zinc-900/30 text-zinc-900 dark:text-zinc-50";
            }

            if (isCorrect) {
              cardStyle = "border-emerald-500/60 bg-white dark:bg-zinc-900/30 text-zinc-900 dark:text-zinc-100 shadow-xs";
            } else if (isWrongSelection) {
              cardStyle = "border-rose-500/60 bg-white dark:bg-zinc-900/30 text-zinc-900 dark:text-zinc-100 shadow-xs";
            } else if (showExplanation) {
              cardStyle = "border-zinc-200/50 dark:border-zinc-800/50 bg-transparent text-zinc-400 dark:text-zinc-500 opacity-60";
            }

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${cardStyle}`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="shrink-0">
                    {showExplanation ? (
                      isCorrect ? (
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                      ) : isWrongSelection ? (
                        <XCircle className="h-4.5 w-4.5 text-rose-500" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-zinc-300 dark:border-zinc-700" />
                      )
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-primary bg-primary text-white"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    )}
                  </div>

                  <span className="leading-relaxed font-medium">
                    {opt.text}
                  </span>
                </div>

                {/* LeetCode Styled Correct / Incorrect Answer Pills (no colored background) */}
                {showExplanation && (
                  <div className="shrink-0 pl-2">
                    {isCorrect && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-emerald-600 dark:text-emerald-400 shadow-xs">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Correct Answer
                      </span>
                    )}
                    {isWrongSelection && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-rose-600 dark:text-rose-400 shadow-xs">
                        <XCircle className="h-3 w-3 text-rose-500" />
                        Incorrect
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showExplanation && selectedOpt && (
          <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
              <HelpCircle className="h-3.5 w-3.5 text-primary" /> Architecture Breakdown
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {selectedOpt.explanation ?? "Verified against system design principles."}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Quit Quiz
          </button>

          {!showExplanation ? (
            <button
              onClick={handleVerify}
              disabled={!currentSelectedOptId}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-primary dark:hover:bg-primary/90 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs hover:shadow-md"
            >
              Verify Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              {currentIdx < totalQuestions - 1 ? "Next Question" : "Finish Quiz"}{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
