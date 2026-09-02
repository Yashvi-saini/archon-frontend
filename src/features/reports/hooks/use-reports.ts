"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchReportsList, fetchReportDetail, type ReportDetailResult } from "../api/reports";
import type { ReportsListResult } from "../types";

export function useReportsList(params?: {
  search?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery<ReportsListResult, Error>({
    queryKey: ["reports", "list", params],
    queryFn: () => fetchReportsList(params),
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useReportDetail(sessionId: string | null) {
  return useQuery<ReportDetailResult, Error>({
    queryKey: ["reports", "detail", sessionId],
    queryFn: () => fetchReportDetail(sessionId!),
    enabled: !!sessionId,
    refetchInterval: (query) => {
      if (query.state.data && query.state.data.status === "evaluating") {
        return 4000;
      }
      return false;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
}
