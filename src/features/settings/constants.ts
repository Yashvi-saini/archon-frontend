import type { UserSettings } from "./types";

export const DEFAULT_USER_SETTINGS: UserSettings = {
  fullName: "Senior Candidate",
  email: "candidate@archon.dev",
  targetLevel: "senior",
  yearsOfExperience: 5,
  primaryStack: "Go",
  targetCompanies: ["Google", "Meta", "Stripe", "Uber"],

  interviewerStrictness: "standard",
  feedbackStyle: "socratic",
  enableProactiveHints: true,
  enableVoiceInterview: false,

  canvasGridType: "dots",
  snapToGrid: true,
  autoSaveIntervalSeconds: 15,
  exportFormat: "svg",

  weeklyInterviewTarget: 3,
  emailNotifications: true,
  weeklyReportDigest: true,
};

export const TARGET_COMPANIES_LIST = [
  "Google",
  "Meta",
  "Amazon",
  "Netflix",
  "Apple",
  "Stripe",
  "Uber",
  "Datadog",
  "Snowflake",
  "Coinbase",
];

export const TECH_STACKS_LIST = ["Go", "Java", "Python", "TypeScript / Node.js", "C++", "Rust"];
