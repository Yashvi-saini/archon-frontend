export type EngineeringLevel = "mid" | "senior" | "staff" | "principal";
export type InterviewerStrictness = "supportive" | "standard" | "rigorous";
export type CanvasGridType = "dots" | "grid" | "blank";

export interface UserSettings {
  // Profile & Target
  fullName: string;
  email: string;
  targetLevel: EngineeringLevel;
  yearsOfExperience: number;
  primaryStack: string;
  targetCompanies: string[];

  // AI Interviewer
  interviewerStrictness: InterviewerStrictness;
  feedbackStyle: "concise" | "detailed" | "socratic";
  enableProactiveHints: boolean;
  enableVoiceInterview: boolean;

  // Canvas
  canvasGridType: CanvasGridType;
  snapToGrid: boolean;
  autoSaveIntervalSeconds: number;
  exportFormat: "png" | "svg" | "json";

  // Goals
  weeklyInterviewTarget: number;
  emailNotifications: boolean;
  weeklyReportDigest: boolean;
}
