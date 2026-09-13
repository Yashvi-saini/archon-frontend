"use client";

import { useState, useEffect, useCallback } from "react";
import type { VerifyDailyChallengeResponse } from "../types";

export interface StoredDailySubmission {
  questionId: string;
  dateKey: string;
  selectedOptionId: string;
  verificationResult: VerifyDailyChallengeResponse;
  coinsEarned: number;
  timestamp: number;
}

export interface UserQuizRewards {
  coins: number;
  streakDays: number;
  lastCompletedDate: string | null;
  completedDates: string[];
}

const SUBMISSION_KEY = "archon_daily_quiz_submission";
const REWARDS_KEY = "archon_quiz_rewards";
const REWARDS_UPDATED_EVENT = "archon_quiz_rewards_updated";

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getYesterdayKey(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
}

export function getStoredSubmission(questionId?: string): StoredDailySubmission | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SUBMISSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDailySubmission;
    const today = getTodayKey();
    if (parsed.dateKey === today) {
      if (!questionId || parsed.questionId === questionId) {
        return parsed;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function getUserRewards(): UserQuizRewards {
  if (typeof window === "undefined") {
    return { coins: 50, streakDays: 1, lastCompletedDate: null, completedDates: [] };
  }
  try {
    const raw = localStorage.getItem(REWARDS_KEY);
    if (!raw) {
      const initial: UserQuizRewards = { coins: 50, streakDays: 0, lastCompletedDate: null, completedDates: [] };
      localStorage.setItem(REWARDS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<UserQuizRewards>;
    const completedDates: string[] = Array.isArray(parsed.completedDates)
      ? [...parsed.completedDates]
      : [];

    if (parsed.lastCompletedDate && !completedDates.includes(parsed.lastCompletedDate)) {
      completedDates.push(parsed.lastCompletedDate);
    }

    const subRaw = localStorage.getItem(SUBMISSION_KEY);
    if (subRaw) {
      try {
        const sub = JSON.parse(subRaw) as StoredDailySubmission;
        if (sub.dateKey && !completedDates.includes(sub.dateKey)) {
          completedDates.push(sub.dateKey);
        }
      } catch {}
    }

    const streakDays = typeof parsed.streakDays === "number" ? parsed.streakDays : 0;
    if (streakDays > 1 && completedDates.length < streakDays && parsed.lastCompletedDate) {
      const baseDate = new Date(parsed.lastCompletedDate);
      for (let i = 1; i < streakDays; i++) {
        const past = new Date(baseDate);
        past.setDate(past.getDate() - i);
        const k = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, "0")}-${String(past.getDate()).padStart(2, "0")}`;
        if (!completedDates.includes(k)) {
          completedDates.push(k);
        }
      }
    }

    return {
      coins: typeof parsed.coins === "number" ? parsed.coins : 50,
      streakDays,
      lastCompletedDate: parsed.lastCompletedDate ?? null,
      completedDates,
    };
  } catch {
    return { coins: 50, streakDays: 0, lastCompletedDate: null, completedDates: [] };
  }
}

export function useQuizRewards() {
  const [rewards, setRewards] = useState<UserQuizRewards>(getUserRewards);

  const refreshRewards = useCallback(() => {
    setRewards(getUserRewards());
  }, []);

  useEffect(() => {
    refreshRewards();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === REWARDS_KEY) {
        refreshRewards();
      }
    };

    const handleCustom = () => {
      refreshRewards();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(REWARDS_UPDATED_EVENT, handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(REWARDS_UPDATED_EVENT, handleCustom);
    };
  }, [refreshRewards]);

  const recordDailyCompletion = useCallback((
    questionId: string,
    selectedOptionId: string,
    verificationResult: VerifyDailyChallengeResponse
  ) => {
    if (typeof window === "undefined") return { coinsEarned: 0, newStreak: 1, alreadyClaimedToday: false };

    const today = getTodayKey();
    const yesterday = getYesterdayKey();
    const currentRewards = getUserRewards();

    const alreadyClaimedToday = currentRewards.lastCompletedDate === today;
    let newStreak = currentRewards.streakDays;
    let coinsEarned = 0;

    if (!alreadyClaimedToday) {
      if (currentRewards.lastCompletedDate === yesterday) {
        newStreak += 1;
      } else {
        newStreak = Math.max(1, currentRewards.streakDays > 0 ? 1 : 1);
      }
      coinsEarned = 10;
    }

    const updatedDates = Array.from(new Set([...currentRewards.completedDates, today]));

    const updatedRewards: UserQuizRewards = {
      coins: currentRewards.coins + coinsEarned,
      streakDays: newStreak,
      lastCompletedDate: today,
      completedDates: updatedDates,
    };

    localStorage.setItem(REWARDS_KEY, JSON.stringify(updatedRewards));

    const submission: StoredDailySubmission = {
      questionId,
      dateKey: today,
      selectedOptionId,
      verificationResult,
      coinsEarned,
      timestamp: Date.now(),
    };

    localStorage.setItem(SUBMISSION_KEY, JSON.stringify(submission));

    window.dispatchEvent(new Event(REWARDS_UPDATED_EVENT));
    setRewards(updatedRewards);

    return {
      coinsEarned,
      newStreak,
      alreadyClaimedToday,
    };
  }, []);

  const resetDailyCompletion = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SUBMISSION_KEY);
    const today = getTodayKey();
    const current = getUserRewards();
    const updatedDates = current.completedDates.filter((d) => d !== today);
    const updatedRewards: UserQuizRewards = {
      ...current,
      completedDates: updatedDates,
      lastCompletedDate: current.lastCompletedDate === today ? null : current.lastCompletedDate,
      streakDays: Math.max(0, current.streakDays - 1),
      coins: Math.max(0, current.coins - 10),
    };
    localStorage.setItem(REWARDS_KEY, JSON.stringify(updatedRewards));
    window.dispatchEvent(new Event(REWARDS_UPDATED_EVENT));
    setRewards(updatedRewards);
  }, []);

  return {
    rewards,
    recordDailyCompletion,
    resetDailyCompletion,
    refreshRewards,
  };
}
