"use client";
import { useQuery } from "@tanstack/react-query";
import { getInterviewReport } from "../api/interview";
import type { InterviewReportResult } from "../types";

export function useInterviewReport(sessionId: string | null) {
  return useQuery<InterviewReportResult, Error>({
    queryKey: ["interview-report", sessionId],
    queryFn: () => getInterviewReport(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status === "evaluating") return 5000;
      return false;
    },
    staleTime: 0,
  });
}
