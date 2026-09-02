"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardOverview } from "../api/dashboard";
import type { DashboardOverviewData } from "../types";

export function useDashboardOverview() {
  return useQuery<DashboardOverviewData, Error>({
    queryKey: ["dashboard", "overview"],
    queryFn: fetchDashboardOverview,
    staleTime: 30 * 1000,
    retry: 1,
  });
}
