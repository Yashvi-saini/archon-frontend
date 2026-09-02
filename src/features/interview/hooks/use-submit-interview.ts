"use client";

import { useMutation } from "@tanstack/react-query";
import { submitInterview } from "../api/interview";

export function useSubmitInterview() {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (sessionId: string) => submitInterview(sessionId),
  });
}
