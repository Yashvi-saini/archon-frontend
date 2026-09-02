import { apiClient } from "@/lib/api-client";
import type {
  CreateInterviewRequest,
  StartInterviewResponse,
  InterviewReportResult,
  Question,
  UserInterviewSummary,
} from "../types";

export async function startInterview(
  payload: CreateInterviewRequest
): Promise<StartInterviewResponse> {
  return apiClient.post<StartInterviewResponse>("/api/v1/interviews/start", payload);
}

export async function getInterviewReport(
  sessionId: string
): Promise<InterviewReportResult> {
  return apiClient.get<InterviewReportResult>(`/api/v1/interviews/${sessionId}/report`);
}

export async function submitInterview(sessionId: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(`/api/v1/interviews/${sessionId}/submit`);
}

export async function fetchInterviewQuestions(): Promise<Question[]> {
  return apiClient.get<Question[]>("/api/v1/interviews/questions");
}

export async function fetchUserInterviews(): Promise<UserInterviewSummary[]> {
  return apiClient.get<UserInterviewSummary[]>("/api/v1/interviews");
}

export function buildChatWsUrl(sessionId: string): string {
  const token = typeof window !== "undefined" ? localStorage.getItem("archon_access_token") ?? "" : "";
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
  const wsBase = apiBaseUrl
    .replace(/^https/, "wss")
    .replace(/^http/, "ws");
  return `${wsBase}/ai/chat?session_id=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`;
}
