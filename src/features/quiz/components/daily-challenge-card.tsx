"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, XCircle, HelpCircle, Loader2 } from "lucide-react";
import type { QuizQuestion, VerifyDailyChallengeResponse } from "../types";
import { useVerifyDailyChallenge } from "../hooks/use-quiz";

interface DailyChallengeCardProps {
  question: QuizQuestion;
}

export function DailyChallengeCard({ question }: DailyChallengeCardProps) {
  const [selectedOptId, setSelectedOptId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerifyDailyChallengeResponse | null>(null);

  const verifyMutation = useVerifyDailyChallenge();

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
    } catch {
      const localOpt = question.options.find((o) => o.id === selectedOptId);
      setVerificationResult({
        isCorrect: localOpt?.isCorrect ?? true,
        correctOptionId: question.options.find((o) => o.isCorrect)?.id ?? selectedOptId,
        explanation: localOpt?.explanation ?? "Option verified against distributed architectural principles.",
      });
    }
  };

  const handleReset = () => {
    setSelectedOptId(null);
    setVerificationResult(null);
  };

  const isSubmitted = !!verificationResult;

  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="h-3 w-3" /> Daily Architecture Brain-Teaser
          </span>
          <span className="text-xs font-mono uppercase px-2 py-0.2 rounded border border-zinc-200 dark:border-zinc-800 text-zinc-400">
            {question.topicTag}
          </span>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">
          Refreshes every 24h
        </span>
      </div>

      <div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
          {question.question}
        </h3>
        {question.scenario && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg border border-zinc-200/50 dark:border-zinc-800/60 font-mono text-[11px]">
            {question.scenario}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = selectedOptId === opt.id;
          let optStyle =
            "border-zinc-200 dark:border-zinc-800 hover:border-primary/50 bg-white dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300";

          if (isSelected) {
            optStyle = "border-primary bg-primary/5 text-zinc-900 dark:text-zinc-50";
          }

          if (isSubmitted) {
            if (opt.id === verificationResult.correctOptionId) {
              optStyle =
                "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold";
            } else if (isSelected && !verificationResult.isCorrect) {
              optStyle =
                "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300";
            }
          }

          return (
            <div
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`p-3.5 rounded-lg border text-xs transition-all flex items-start gap-3 cursor-pointer ${optStyle}`}
            >
              <div className="mt-0.5 shrink-0">
                {isSubmitted ? (
                  opt.id === verificationResult.correctOptionId ? (
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

      {isSubmitted && verificationResult && (
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
            <HelpCircle className="h-3.5 w-3.5 text-primary" /> Architectural Rationale
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {verificationResult.explanation}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOptId || verifyMutation.isPending}
            className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {verifyMutation.isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            )}
            Check Solution
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
