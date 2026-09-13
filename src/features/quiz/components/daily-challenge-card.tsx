"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, HelpCircle, Loader2, Flame, Clock, Coins, Sparkles, RotateCcw } from "lucide-react";
import type { QuizQuestion, VerifyDailyChallengeResponse } from "../types";
import { useVerifyDailyChallenge } from "../hooks/use-quiz";
import { useQuizRewards, getStoredSubmission } from "../hooks/use-quiz-rewards";
import { toast } from "sonner";

interface DailyChallengeCardProps {
  question: QuizQuestion;
}

export function DailyChallengeCard({ question }: DailyChallengeCardProps) {
  const { rewards, recordDailyCompletion, resetDailyCompletion } = useQuizRewards();

  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerifyDailyChallengeResponse | null>(null);

  const verifyMutation = useVerifyDailyChallenge();

  // Restore existing submission when user returns to quiz from another tab
  useEffect(() => {
    const stored = getStoredSubmission(question.id);
    if (stored) {
      setSelectedOptId(stored.selectedOptionId);
      setVerificationResult(stored.verificationResult);
    }
  }, [question.id]);

  const handleSelect = (optId: string) => {
    if (verificationResult) return;
    setSelectedOptId(optId);
  };

  const handleSubmit = async () => {
    if (!selectedOptId) return;

    try {
      const res = await verifyMutation.mutateAsync({
        question_id: question.id,
        selected_option_id: selectedOptId,
      });
      setVerificationResult(res);

      // Record daily completion, award coins & update streak
      const rewardInfo = recordDailyCompletion(question.id, selectedOptId, res);
      if (rewardInfo && !rewardInfo.alreadyClaimedToday) {
        toast.success("Today's streak completed! 🔥");
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to verify answer";
      toast.error(errorMsg);
    }
  };

  const handleReset = () => {
    setSelectedOptId(null);
    setVerificationResult(null);
    resetDailyCompletion();
    // No toast for reset per user request
  };

  const isSubmitted = !!verificationResult;

  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-4">
      {/* Top Header Row with LeetCode Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* LeetCode Styled Daily Challenge Pill with Flame */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs">
            <Flame className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span>Daily Architecture Challenge</span>
          </span>

          {/* LeetCode Styled Topic Tag Pill */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 shadow-xs">
            {question.topicTag}
          </span>

          {/* Challenge Solved Pill */}
          {isSubmitted && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs animate-in fade-in duration-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Challenge Solved</span>
            </span>
          )}
        </div>

        {/* Right side pills: Coins, Streak, and Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          {isSubmitted && (
            <>
              {/* LeetCode styled coin capsule pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 shadow-xs animate-in fade-in duration-200">
                <Coins className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-amber-600 dark:text-amber-400">+10 Coins</span>
              </span>

              {/* LeetCode styled streak capsule pill */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 shadow-xs animate-in fade-in duration-200">
                <Flame className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-amber-600 dark:text-amber-400">{rewards.streakDays} Day Streak</span>
              </span>
            </>
          )}

          {/* Duration/Refresh Pill */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs">
            <Clock className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
            <span>Refreshes every 24h</span>
          </span>
        </div>
      </div>

      {/* Question Prompt */}
      <div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
          {question.question}
        </h3>
        {question.scenario && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[11px]">
            {question.scenario}
          </p>
        )}
      </div>

      {/* Answer Options with LeetCode Correct & Incorrect Status Pills */}
      <div className="space-y-2.5">
        {question.options.map((opt) => {
          const isSelected = selectedOptId === opt.id;
          const isCorrect = isSubmitted && opt.id === verificationResult.correctOptionId;
          const isWrongSelection = isSubmitted && isSelected && !verificationResult.isCorrect;

          let cardStyle =
            "border-zinc-200 dark:border-zinc-800 hover:border-primary/50 bg-white dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300";

          if (isSelected && !isSubmitted) {
            cardStyle = "border-primary bg-white dark:bg-zinc-900/40 text-zinc-900 dark:text-zinc-50";
          }

          if (isCorrect) {
            cardStyle = "border-emerald-500/60 bg-white dark:bg-zinc-900/40 text-zinc-900 dark:text-zinc-100 shadow-xs";
          } else if (isWrongSelection) {
            cardStyle = "border-rose-500/60 bg-white dark:bg-zinc-900/40 text-zinc-900 dark:text-zinc-100 shadow-xs";
          } else if (isSubmitted) {
            cardStyle = "border-zinc-200/50 dark:border-zinc-800/50 bg-transparent text-zinc-400 dark:text-zinc-500 opacity-60";
          }

          return (
            <div
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`p-3.5 rounded-xl border text-xs transition-all flex items-center justify-between gap-3 cursor-pointer ${cardStyle}`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="shrink-0">
                  {isSubmitted ? (
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
              {isSubmitted && (
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

      {/* Explanation when verified */}
      {isSubmitted && verificationResult && (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
            <HelpCircle className="h-3.5 w-3.5 text-primary" /> Architectural Rationale
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {verificationResult.explanation}
          </p>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between pt-1">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOptId || verifyMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-primary dark:hover:bg-primary/90 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-xs hover:shadow-md"
          >
            {verifyMutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            Check Solution
          </button>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Completed for Today
            </span>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Retake for Practice
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

