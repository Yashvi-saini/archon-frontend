
import type {
  CreateInterviewRequest,
  StartInterviewResponse,
  InterviewReportResult,
} from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("archon_access_token");
}

export async function startInterview(
  payload: CreateInterviewRequest
): Promise<StartInterviewResponse> {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated. Please log in.");

  const res = await fetch(`${API_BASE_URL}/api/v1/interviews/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      errBody?.error ||
      errBody?.message ||
      `Failed to start interview (${res.status})`
    );
  }

  const data = await res.json();
  return (data?.data ?? data) as StartInterviewResponse;
}


export async function getInterviewReport(
  sessionId: string
): Promise<InterviewReportResult> {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated. Please log in.");

  const res = await fetch(
    `${API_BASE_URL}/api/v1/interviews/${sessionId}/report`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (res.status === 202) return { status: "evaluating" };

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(
      errBody?.error ||
      errBody?.message ||
      `Failed to fetch report (${res.status})`
    );
  }

  const data = await res.json();
  return { status: "done", report: data?.data ?? data };
}

export function buildChatWsUrl(sessionId: string): string {
  const token = getAccessToken() ?? "";
  // Convert http(s) → ws(s)
  const wsBase = API_BASE_URL
    .replace(/^https/, "wss")
    .replace(/^http/, "ws");
  return `${wsBase}/ai/chat?session_id=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`;
}
