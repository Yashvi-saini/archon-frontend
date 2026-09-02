import { apiClient } from "@/lib/api-client";
import type { UserSettings, EngineeringLevel, InterviewerStrictness, CanvasGridType } from "../types";
import { DEFAULT_USER_SETTINGS } from "../constants";

interface RawUserSettings {
  full_name?: string;
  fullName?: string;
  email?: string;
  target_level?: string;
  targetLevel?: string;
  years_of_experience?: number;
  yearsOfExperience?: number;
  primary_stack?: string;
  primaryStack?: string;
  target_companies?: string[];
  targetCompanies?: string[];
  interviewer_strictness?: string;
  interviewerStrictness?: string;
  feedback_style?: string;
  feedbackStyle?: string;
  enable_proactive_hints?: boolean;
  enableProactiveHints?: boolean;
  enable_voice_interview?: boolean;
  enableVoiceInterview?: boolean;
  canvas_grid_type?: string;
  canvasGridType?: string;
  snap_to_grid?: boolean;
  snapToGrid?: boolean;
  auto_save_interval_seconds?: number;
  autoSaveIntervalSeconds?: number;
  export_format?: string;
  exportFormat?: string;
  weekly_interview_target?: number;
  weeklyInterviewTarget?: number;
  email_notifications?: boolean;
  emailNotifications?: boolean;
  weekly_report_digest?: boolean;
  weeklyReportDigest?: boolean;
}

export function normalizeSettings(raw?: RawUserSettings | null): UserSettings {
  if (!raw) return DEFAULT_USER_SETTINGS;

  return {
    fullName: raw.full_name ?? raw.fullName ?? DEFAULT_USER_SETTINGS.fullName,
    email: raw.email ?? DEFAULT_USER_SETTINGS.email,
    targetLevel: ((raw.target_level ?? raw.targetLevel ?? DEFAULT_USER_SETTINGS.targetLevel).toLowerCase()) as EngineeringLevel,
    yearsOfExperience: raw.years_of_experience ?? raw.yearsOfExperience ?? DEFAULT_USER_SETTINGS.yearsOfExperience,
    primaryStack: raw.primary_stack ?? raw.primaryStack ?? DEFAULT_USER_SETTINGS.primaryStack,
    targetCompanies: raw.target_companies ?? raw.targetCompanies ?? DEFAULT_USER_SETTINGS.targetCompanies,
    interviewerStrictness: ((raw.interviewer_strictness ?? raw.interviewerStrictness ?? DEFAULT_USER_SETTINGS.interviewerStrictness).toLowerCase()) as InterviewerStrictness,
    feedbackStyle: (raw.feedback_style ?? raw.feedbackStyle ?? DEFAULT_USER_SETTINGS.feedbackStyle) as "concise" | "detailed" | "socratic",
    enableProactiveHints: raw.enable_proactive_hints ?? raw.enableProactiveHints ?? DEFAULT_USER_SETTINGS.enableProactiveHints,
    enableVoiceInterview: raw.enable_voice_interview ?? raw.enableVoiceInterview ?? DEFAULT_USER_SETTINGS.enableVoiceInterview,
    canvasGridType: (raw.canvas_grid_type ?? raw.canvasGridType ?? DEFAULT_USER_SETTINGS.canvasGridType) as CanvasGridType,
    snapToGrid: raw.snap_to_grid ?? raw.snapToGrid ?? DEFAULT_USER_SETTINGS.snapToGrid,
    autoSaveIntervalSeconds: raw.auto_save_interval_seconds ?? raw.autoSaveIntervalSeconds ?? DEFAULT_USER_SETTINGS.autoSaveIntervalSeconds,
    exportFormat: (raw.export_format ?? raw.exportFormat ?? DEFAULT_USER_SETTINGS.exportFormat) as "png" | "svg" | "json",
    weeklyInterviewTarget: raw.weekly_interview_target ?? raw.weeklyInterviewTarget ?? DEFAULT_USER_SETTINGS.weeklyInterviewTarget,
    emailNotifications: raw.email_notifications ?? raw.emailNotifications ?? DEFAULT_USER_SETTINGS.emailNotifications,
    weeklyReportDigest: raw.weekly_report_digest ?? raw.weeklyReportDigest ?? DEFAULT_USER_SETTINGS.weeklyReportDigest,
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
