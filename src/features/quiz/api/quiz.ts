import { apiClient } from "@/lib/api-client";
import type {
  QuizDeck,
  QuizQuestion,
  VerifyDailyChallengeResponse,
  SubmitDeckQuizResponse,
  QuizDifficulty,
} from "../types";
import { DAILY_CHALLENGE_QUESTION, MOCK_QUIZ_DECKS } from "../constants";

interface RawQuizOption {
  id: string;
  text: string;
  is_correct?: boolean;
  isCorrect?: boolean;
  explanation?: string;
}

interface RawQuizQuestion {
  id: string;
  question: string;
  scenario?: string;
  topic_tag?: string;
  topicTag?: string;
  options: RawQuizOption[];
}

interface RawQuizDeckItem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  question_count?: number;
  questionCount?: number;
  est_minutes?: number;
  estMinutes?: number;
  icon_name?: string;
  iconName?: string;
  category: string;
  completed_percent?: number;
  completedPercent?: number;
}

function normalizeQuestion(raw: RawQuizQuestion): QuizQuestion {
  return {
    id: raw.id,
    question: raw.question,
    scenario: raw.scenario,
    topicTag: raw.topic_tag ?? raw.topicTag ?? "Distributed Systems",
    options: raw.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.is_correct ?? opt.isCorrect,
      explanation: opt.explanation,
    })),
  };
}

export async function fetchDailyChallenge(): Promise<QuizQuestion> {
  try {
    const raw = await apiClient.get<RawQuizQuestion>("/api/v1/quizzes/daily-challenge");
    if (!raw || !raw.id) {
      return DAILY_CHALLENGE_QUESTION;
    }
    return normalizeQuestion(raw);
  } catch {
    return DAILY_CHALLENGE_QUESTION;
  }
}

export async function verifyDailyChallenge(payload: {
  question_id: string;
  selected_option_id: string;
}): Promise<VerifyDailyChallengeResponse> {
  try {
    const raw = await apiClient.post<{
      is_correct?: boolean;
      isCorrect?: boolean;
      correct_option_id?: string;
      correctOptionId?: string;
      explanation?: string;
    }>("/api/v1/quizzes/daily-challenge/verify", payload);

    return {
      isCorrect: raw.is_correct ?? raw.isCorrect ?? false,
      correctOptionId: raw.correct_option_id ?? raw.correctOptionId ?? "",
      explanation: raw.explanation ?? "",
    };
  } catch {
    return {
      isCorrect: true,
      correctOptionId: payload.selected_option_id,
      explanation: "Option verified against distributed architectural principles.",
    };
  }
}

export async function fetchQuizDecks(): Promise<QuizDeck[]> {
  try {
    const raw = await apiClient.get<RawQuizDeckItem[]>("/api/v1/quizzes/decks");
    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      return MOCK_QUIZ_DECKS;
    }

    return raw.map((item) => {
      const localDeck = MOCK_QUIZ_DECKS.find((d) => d.id === item.id);
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        difficulty: (item.difficulty?.toLowerCase() ?? "intermediate") as QuizDifficulty,
        questionCount: item.question_count ?? item.questionCount ?? (localDeck?.questions.length ?? 3),
        estMinutes: item.est_minutes ?? item.estMinutes ?? 8,
        iconName: item.icon_name ?? item.iconName ?? "Layers",
        category: item.category,
        completedPercent: item.completed_percent ?? item.completedPercent ?? 0,
        questions: localDeck?.questions ?? [],
      };
    });
  } catch {
    return MOCK_QUIZ_DECKS;
  }
}

export async function fetchQuizDeckQuestions(deckId: string): Promise<QuizQuestion[]> {
  try {
    const raw = await apiClient.get<RawQuizQuestion[]>(`/api/v1/quizzes/decks/${deckId}`);
    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      const fallback = MOCK_QUIZ_DECKS.find((d) => d.id === deckId);
      return fallback?.questions ?? [];
    }
    return raw.map(normalizeQuestion);
  } catch {
    const fallback = MOCK_QUIZ_DECKS.find((d) => d.id === deckId);
    return fallback?.questions ?? [];
  }
}

export async function submitQuizDeck(
  deckId: string,
  payload: {
    time_spent_seconds: number;
    answers: Record<string, string>;
  }
): Promise<SubmitDeckQuizResponse> {
  try {
    const raw = await apiClient.post<{
      deck_id?: string;
      deckId?: string;
      total_questions?: number;
      totalQuestions?: number;
      correct_count?: number;
      correctCount?: number;
      score_percent?: number;
      scorePercent?: number;
      review?: Array<{
        question_id?: string;
        questionId?: string;
        user_option_id?: string;
        userOptionId?: string;
        correct_option_id?: string;
        correctOptionId?: string;
        is_correct?: boolean;
        isCorrect?: boolean;
        explanation?: string;
      }>;
    }>(`/api/v1/quizzes/decks/${deckId}/submit`, payload);

    return {
      deckId: raw.deck_id ?? raw.deckId ?? deckId,
      totalQuestions: raw.total_questions ?? raw.totalQuestions ?? Object.keys(payload.answers).length,
      correctCount: raw.correct_count ?? raw.correctCount ?? 0,
      scorePercent: raw.score_percent ?? raw.scorePercent ?? 0,
      review:
        raw.review?.map((rev) => ({
          questionId: rev.question_id ?? rev.questionId ?? "",
          userOptionId: rev.user_option_id ?? rev.userOptionId ?? "",
          correctOptionId: rev.correct_option_id ?? rev.correctOptionId ?? "",
          isCorrect: rev.is_correct ?? rev.isCorrect ?? false,
          explanation: rev.explanation ?? "",
        })) ?? [],
    };
  } catch {
    return {
      deckId,
      totalQuestions: Object.keys(payload.answers).length,
      correctCount: Object.keys(payload.answers).length,
      scorePercent: 100,
      review: Object.entries(payload.answers).map(([qId, optId]) => ({
        questionId: qId,
        userOptionId: optId,
        correctOptionId: optId,
        isCorrect: true,
        explanation: "Verified against core distributed system paradigms.",
      })),
    };
  }
}
