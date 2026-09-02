"use client";

import React, { useState, useEffect } from "react";
import { X, Clock, HelpCircle, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { QuizScoreModal } from "./quiz-score-modal";
import type { QuizDeck } from "../types";

interface QuizRunnerModalProps {
  deck: QuizDeck;
  onClose: () => void;
}

export function QuizRunnerModal({ deck, onClose }: QuizRunnerModalProps) {
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

  const currentQuestion = deck.questions[currentIdx];
  const totalQuestions = deck.questions.length;
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

  const handleNext = () => {
    setShowExplanation(false);
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setIsCompleted(true);
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
        deck={deck}
        selectedAnswers={selectedAnswers}
        onRetry={handleRetry}
        onExit={onClose}
      />
    );
  }

  if (!currentQuestion) return null;

  const selectedOpt = currentQuestion.options.find((o) => o.id === currentSelectedOptId);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111318] border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 relative">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary font-bold">
              {deck.title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Question {currentIdx + 1} of {totalQuestions}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md">
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

        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400">
              {currentQuestion.topicTag}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-50 leading-relaxed">
            {currentQuestion.question}
          </h3>
          {currentQuestion.scenario && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 font-mono text-[11px] leading-relaxed">
              {currentQuestion.scenario}
            </p>
          )}
        </div>

        <div className="space-y-2.5">
          {currentQuestion.options.map((opt) => {
            const isSelected = currentSelectedOptId === opt.id;
            let style =
              "border-zinc-200 dark:border-zinc-800 hover:border-primary/50 bg-white dark:bg-zinc-900/30 text-zinc-700 dark:text-zinc-300";

            if (isSelected) {
              style = "border-primary bg-primary/5 text-zinc-900 dark:text-zinc-50";
            }

            if (showExplanation) {
              if (opt.isCorrect) {
                style =
                  "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold";
              } else if (isSelected && !opt.isCorrect) {
                style =
                  "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300";
              }
            }

            return (
              <div
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`p-3.5 rounded-lg border text-xs transition-all flex items-start gap-3 cursor-pointer ${style}`}
              >
                <div className="mt-0.5 shrink-0">
                  {showExplanation ? (
                    opt.isCorrect ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : isSelected ? (
                      <XCircle className="h-4 w-4 text-rose-500" />
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
                <span className="flex-1 leading-relaxed">{opt.text}</span>
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
              {selectedOpt.explanation}
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
              className="px-5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
