"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProfileRoleTab } from "./profile-role-tab";
import { InterviewerAiTab } from "./interviewer-ai-tab";
import { WorkspaceCanvasTab } from "./workspace-canvas-tab";
import { PreferencesTab } from "./preferences-tab";
import type { UserSettings } from "../types";
import { Check, User, Bot, Layout, BellRing, Loader2, RefreshCw } from "lucide-react";
import { useUserSettings, useUpdateUserSettings } from "../hooks/use-settings";

type SettingsTabKey = "profile" | "ai" | "canvas" | "preferences";

// Structural zero-value defaults — used only while API is loading, never shown as fake data
const EMPTY_SETTINGS: UserSettings = {
  fullName: "",
  email: "",
  targetLevel: "senior",
  yearsOfExperience: 0,
  primaryStack: "",
  targetCompanies: [],
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

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("profile");

  const { data: serverSettings, isLoading: isServerLoading, isError: isServerError, refetch } = useUserSettings();
  const updateMutation = useUpdateUserSettings();

  const [settings, setSettings] = useState<UserSettings>(EMPTY_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (serverSettings && !hasChanges) {
      setSettings(serverSettings);
    }
  }, [serverSettings, hasChanges]);

  const handleChange = (updated: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(settings);
      setHasChanges(false);
      toast.success("Workspace preferences saved successfully");
    } catch {
      toast.error("Failed to save settings. Please try again.");
    }
  };

  const handleReset = () => {
    if (serverSettings) {
      setSettings(serverSettings);
      setHasChanges(false);
      toast.info("Reset to last saved preferences");
    }
  };

  const tabs: { key: SettingsTabKey; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Target Role & Profile", icon: User },
    { key: "ai", label: "AI Interviewer Persona", icon: Bot },
    { key: "canvas", label: "Whiteboard & Canvas", icon: Layout },
    { key: "preferences", label: "Goals & Notifications", icon: BellRing },
  ];

  if (isServerError) {
    return (
      <div className="max-w-[1550px] mx-auto w-full p-6 lg:p-8 xl:p-10 space-y-8 animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Workspace Settings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5">
            Customize target level calibrations, AI interviewer rigor, and whiteboarding preferences.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-full">
            <RefreshCw className="h-6 w-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Failed to load settings</h3>
            <p className="text-xs text-zinc-500 mt-1">Could not reach the settings endpoint. Please try again.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1550px] mx-auto w-full p-6 lg:p-8 xl:p-10 space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Workspace Settings
            </h1>
            {isServerLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            )}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
            Customize target level calibrations, AI interviewer rigor, and whiteboarding preferences.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {hasChanges && (
            <button
              onClick={handleReset}
              disabled={!serverSettings}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer disabled:opacity-40"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending || isServerLoading}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1 p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs">
          {isServerLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
                  <div className="h-9 w-full bg-zinc-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeTab === "profile" && (
                <ProfileRoleTab settings={settings} onChange={handleChange} />
              )}
              {activeTab === "ai" && (
                <InterviewerAiTab settings={settings} onChange={handleChange} />
              )}
              {activeTab === "canvas" && (
                <WorkspaceCanvasTab settings={settings} onChange={handleChange} />
              )}
              {activeTab === "preferences" && (
                <PreferencesTab settings={settings} onChange={handleChange} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
