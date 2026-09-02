"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAnalytics } from "../api/analytics";
import type { OverallAnalytics, TimeRange } from "../types";

export function useAnalytics(range: TimeRange = "30d") {
  return useQuery<OverallAnalytics, Error>({
    queryKey: ["analytics", range],
    queryFn: () => fetchAnalytics(range),
    staleTime: 30 * 1000,
    retry: 1,
  });
}
