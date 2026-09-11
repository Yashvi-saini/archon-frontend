"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserSettings, saveUserSettings } from "../api/settings";
import type { UserSettings } from "../types";

export function useUserSettings() {
  return useQuery<UserSettings, Error>({
    queryKey: ["settings"],
    queryFn: fetchUserSettings,
    staleTime: 60 * 1000,
    retry: 1,
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, UserSettings>({
    mutationFn: saveUserSettings,
    onSuccess: (_, variables) => {
      queryClient.setQueryData(["settings"], variables);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
