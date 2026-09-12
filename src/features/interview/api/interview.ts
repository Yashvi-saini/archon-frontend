import { apiClient } from "@/lib/api-client";
import type {
  CreateInterviewRequest,
  StartInterviewResponse,
  InterviewReportResult,
  Question,
  UserInterviewSummary,
  DiagramResponse,
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

export async function fetchInterviewDiagram(sessionId: string): Promise<DiagramResponse> {
  return apiClient.get<DiagramResponse>(`/api/v1/interviews/${sessionId}/diagram`);
}

export function buildChatWsUrl(sessionId: string): string {
  const token = typeof window !== "undefined" ? localStorage.getItem("archon_access_token") ?? "" : "";
  let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8071";

  if (!apiBaseUrl.startsWith("http://") && !apiBaseUrl.startsWith("https://") && !apiBaseUrl.startsWith("ws://") && !apiBaseUrl.startsWith("wss://")) {
    if (typeof window !== "undefined") {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      apiBaseUrl = `${protocol}//${window.location.host}${apiBaseUrl.startsWith("/") ? "" : "/"}${apiBaseUrl}`;
    }
  }

  const wsBase = apiBaseUrl
    .replace(/^https:/, "wss:")
    .replace(/^http:/, "ws:")
    .replace(/\/+$/, "");

  return `${wsBase}/ai/chat?session_id=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`;
}
