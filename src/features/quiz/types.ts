export type QuizDifficulty = "beginner" | "intermediate" | "senior" | "staff";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  explanation?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  scenario?: string;
  options: QuizOption[];
  codeSnippet?: string;
  topicTag: string;
}

export interface QuizDeck {
  id: string;
  title: string;
  description: string;
  difficulty: QuizDifficulty;
  questionCount: number;
  estMinutes: number;
  iconName: string;
  category: string;
  completedPercent: number;
  questions: QuizQuestion[];
}

export interface QuizSessionState {
  currentQuestionIndex: number;
  selectedAnswers: Record<string, string>;
  showExplanation: boolean;
  isCompleted: boolean;
  score: number;
  timeSpentSeconds: number;
}

export interface VerifyDailyChallengeResponse {
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
}

export interface QuestionReviewItem {
  questionId: string;
  userOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  explanation: string;
}

export interface SubmitDeckQuizResponse {
  deckId: string;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  review: QuestionReviewItem[];
}
