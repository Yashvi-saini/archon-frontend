"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDailyChallenge,
  verifyDailyChallenge,
  fetchQuizDecks,
  fetchQuizDeckQuestions,
  submitQuizDeck,
} from "../api/quiz";
import type { QuizDeck, QuizQuestion, VerifyDailyChallengeResponse, SubmitDeckQuizResponse } from "../types";

export function useDailyChallenge() {
  return useQuery<QuizQuestion, Error>({
    queryKey: ["quiz", "daily-challenge"],
    queryFn: fetchDailyChallenge,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useVerifyDailyChallenge() {
  return useMutation<
    VerifyDailyChallengeResponse,
    Error,
    { question_id: string; selected_option_id: string }
  >({
    mutationFn: verifyDailyChallenge,
  });
}

export function useQuizDecks() {
  return useQuery<QuizDeck[], Error>({
    queryKey: ["quiz", "decks"],
    queryFn: fetchQuizDecks,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useQuizDeckQuestions(deckId: string | null) {
  return useQuery<QuizQuestion[], Error>({
    queryKey: ["quiz", "deck-questions", deckId],
    queryFn: () => fetchQuizDeckQuestions(deckId!),
    enabled: !!deckId,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useSubmitQuizDeck() {
  const queryClient = useQueryClient();

  return useMutation<
    SubmitDeckQuizResponse,
    Error,
    {
      deckId: string;
      payload: {
        time_spent_seconds: number;
        answers: Record<string, string>;
      };
    }
  >({
    mutationFn: ({ deckId, payload }) => submitQuizDeck(deckId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", "decks"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "overview"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
