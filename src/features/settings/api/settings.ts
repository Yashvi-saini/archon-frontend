import { apiClient } from "@/lib/api-client";
import type { UserSettings, EngineeringLevel, InterviewerStrictness, CanvasGridType } from "../types";

interface RawUserSettings {
  full_name?: string;
  email?: string;
  target_level?: string;
  years_of_experience?: number;
  primary_stack?: string;
  target_companies?: string[];
  interviewer_strictness?: string;
  feedback_style?: string;
  enable_proactive_hints?: boolean;
  enable_voice_interview?: boolean;
  canvas_grid_type?: string;
  snap_to_grid?: boolean;
  auto_save_interval_seconds?: number;
  export_format?: string;
  weekly_interview_target?: number;
  email_notifications?: boolean;
  weekly_report_digest?: boolean;
}

export function normalizeSettings(raw: RawUserSettings): UserSettings {
  return {
    fullName: raw.full_name ?? "",
    email: raw.email ?? "",
    targetLevel: (raw.target_level?.toLowerCase() ?? "senior") as EngineeringLevel,
    yearsOfExperience: raw.years_of_experience ?? 0,
    primaryStack: raw.primary_stack ?? "",
    targetCompanies: raw.target_companies ?? [],
    interviewerStrictness: (raw.interviewer_strictness?.toLowerCase() ?? "standard") as InterviewerStrictness,
    feedbackStyle: (raw.feedback_style ?? "socratic") as "concise" | "detailed" | "socratic",
    enableProactiveHints: raw.enable_proactive_hints ?? true,
    enableVoiceInterview: raw.enable_voice_interview ?? false,
    canvasGridType: (raw.canvas_grid_type ?? "dots") as CanvasGridType,
    snapToGrid: raw.snap_to_grid ?? true,
    autoSaveIntervalSeconds: raw.auto_save_interval_seconds ?? 15,
    exportFormat: (raw.export_format ?? "svg") as "png" | "svg" | "json",
    weeklyInterviewTarget: raw.weekly_interview_target ?? 3,
    emailNotifications: raw.email_notifications ?? true,
    weeklyReportDigest: raw.weekly_report_digest ?? true,
  };
}

export async function fetchUserSettings(): Promise<UserSettings> {
  const raw = await apiClient.get<RawUserSettings>("/api/v1/settings");
  return normalizeSettings(raw);
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  const payload: RawUserSettings = {
    full_name: settings.fullName,
    email: settings.email,
    target_level: settings.targetLevel,
    years_of_experience: settings.yearsOfExperience,
    primary_stack: settings.primaryStack,
    target_companies: settings.targetCompanies,
    interviewer_strictness: settings.interviewerStrictness,
    feedback_style: settings.feedbackStyle,
    enable_proactive_hints: settings.enableProactiveHints,
    enable_voice_interview: settings.enableVoiceInterview,
    canvas_grid_type: settings.canvasGridType,
    snap_to_grid: settings.snapToGrid,
    auto_save_interval_seconds: settings.autoSaveIntervalSeconds,
    export_format: settings.exportFormat,
    weekly_interview_target: settings.weeklyInterviewTarget,
    email_notifications: settings.emailNotifications,
    weekly_report_digest: settings.weeklyReportDigest,
  };

  await apiClient.put("/api/v1/settings", payload);
}
