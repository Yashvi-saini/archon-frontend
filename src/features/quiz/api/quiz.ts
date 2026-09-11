import { apiClient } from "@/lib/api-client";
import type {
  QuizDeck,
  QuizQuestion,
  VerifyDailyChallengeResponse,
  SubmitDeckQuizResponse,
  QuizDifficulty,
} from "../types";

interface RawQuizOption {
  id: string;
  text: string;
  is_correct?: boolean;
  explanation?: string;
}

interface RawQuizQuestion {
  id: string;
  question: string;
  scenario?: string;
  topic_tag?: string;
  options: RawQuizOption[];
}

interface RawQuizDeckItem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  question_count?: number;
  est_minutes?: number;
  icon_name?: string;
  category: string;
  completed_percent?: number;
}

function normalizeQuestion(raw: RawQuizQuestion): QuizQuestion {
  return {
    id: raw.id,
    question: raw.question,
    scenario: raw.scenario,
    topicTag: raw.topic_tag ?? "Distributed Systems",
    options: raw.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.is_correct,
      explanation: opt.explanation,
    })),
  };
}

export async function fetchDailyChallenge(): Promise<QuizQuestion> {
  const raw = await apiClient.get<RawQuizQuestion>("/api/v1/quizzes/daily-challenge");
  return normalizeQuestion(raw);
}

export async function verifyDailyChallenge(payload: {
  question_id: string;
  selected_option_id: string;
}): Promise<VerifyDailyChallengeResponse> {
  const raw = await apiClient.post<{
    is_correct?: boolean;
    correct_option_id?: string;
    explanation?: string;
  }>("/api/v1/quizzes/daily-challenge/verify", payload);

  return {
    isCorrect: raw.is_correct ?? false,
    correctOptionId: raw.correct_option_id ?? "",
    explanation: raw.explanation ?? "",
  };
}

export async function fetchQuizDecks(): Promise<QuizDeck[]> {
  const raw = await apiClient.get<RawQuizDeckItem[]>("/api/v1/quizzes/decks");
  if (!raw || !Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  return raw.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    difficulty: (item.difficulty?.toLowerCase() ?? "intermediate") as QuizDifficulty,
    questionCount: item.question_count ?? 0,
    estMinutes: item.est_minutes ?? 10,
    iconName: item.icon_name ?? "Layers",
    category: item.category,
    completedPercent: item.completed_percent ?? 0,
    questions: [],
  }));
}

export async function fetchQuizDeckQuestions(deckId: string): Promise<QuizQuestion[]> {
  const raw = await apiClient.get<RawQuizQuestion[]>(`/api/v1/quizzes/decks/${deckId}`);
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map(normalizeQuestion);
}

export async function submitQuizDeck(
  deckId: string,
  payload: {
    time_spent_seconds: number;
    answers: Record<string, string>;
  }
): Promise<SubmitDeckQuizResponse> {
  const raw = await apiClient.post<{
    deck_id?: string;
    total_questions?: number;
    correct_count?: number;
    score_percent?: number;
    review?: Array<{
      question_id?: string;
      user_option_id?: string;
      correct_option_id?: string;
      is_correct?: boolean;
      explanation?: string;
    }>;
  }>(`/api/v1/quizzes/decks/${deckId}/submit`, payload);

  return {
    deckId: raw.deck_id ?? deckId,
    totalQuestions: raw.total_questions ?? Object.keys(payload.answers).length,
    correctCount: raw.correct_count ?? 0,
    scorePercent: raw.score_percent ?? 0,
    review:
      raw.review?.map((rev) => ({
        questionId: rev.question_id ?? "",
        userOptionId: rev.user_option_id ?? "",
        correctOptionId: rev.correct_option_id ?? "",
        isCorrect: rev.is_correct ?? false,
        explanation: rev.explanation ?? "",
      })) ?? [],
  };
}
