"use client";

import { useMutation } from "@tanstack/react-query";
import { startInterview } from "../api/interview";
import type { CreateInterviewRequest, StartInterviewResponse } from "../types";

export function useStartInterview() {
  return useMutation<StartInterviewResponse, Error, CreateInterviewRequest>({
    mutationFn: (payload) => startInterview(payload),
  });
}
