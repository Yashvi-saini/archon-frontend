"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserSettings, saveUserSettings } from "../api/settings";
import type { UserSettings } from "../types";
import { DEFAULT_USER_SETTINGS } from "../constants";

export function useUserSettings() {
  return useQuery<UserSettings, Error>({
    queryKey: ["settings"],
    queryFn: fetchUserSettings,
    placeholderData: () => {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem("archon_user_settings");
          if (saved) return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(saved) };
        } catch {
          // ignore
        }
      }
      return DEFAULT_USER_SETTINGS;
    },
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UserSettings>({
    mutationFn: saveUserSettings,
    onSuccess: (_, variables) => {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("archon_user_settings", JSON.stringify(variables));
        } catch {
          // ignore
        }
      }
      queryClient.setQueryData(["settings"], variables);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
