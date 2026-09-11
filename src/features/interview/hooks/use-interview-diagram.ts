"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInterviewDiagram } from "../api/interview";

export function useInterviewDiagram(sessionId: string | null) {
  return useQuery({
    queryKey: ["interview-diagram", sessionId],
    queryFn: () => fetchInterviewDiagram(sessionId!),
    enabled: !!sessionId,
    staleTime: 30_000,
  });
}
