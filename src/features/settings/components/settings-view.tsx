"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProfileRoleTab } from "./profile-role-tab";
import { InterviewerAiTab } from "./interviewer-ai-tab";
import { WorkspaceCanvasTab } from "./workspace-canvas-tab";
import { PreferencesTab } from "./preferences-tab";
import { DEFAULT_USER_SETTINGS } from "../constants";
import type { UserSettings } from "../types";
import { Check, User, Bot, Layout, BellRing, Loader2 } from "lucide-react";
import { useUserSettings, useUpdateUserSettings } from "../hooks/use-settings";

type SettingsTabKey = "profile" | "ai" | "canvas" | "preferences";

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>("profile");

  const { data: serverSettings, isLoading: isServerLoading } = useUserSettings();
  const updateMutation = useUpdateUserSettings();

  const [settings, setSettings] = useState<UserSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("archon_user_settings");
        if (saved) {
          return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(saved) };
        }
      } catch {
        // ignore
      }
    }
    return DEFAULT_USER_SETTINGS;
  });
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
      try {
        localStorage.setItem("archon_user_settings", JSON.stringify(settings));
        setHasChanges(false);
        toast.info("Saved to local workspace cache");
      } catch {
        toast.error("Failed to save settings");
      }
    }
  };

  const handleReset = () => {
    setSettings(serverSettings ?? DEFAULT_USER_SETTINGS);
    setHasChanges(true);
    toast.info("Reset to default preferences");
  };

  const tabs: { key: SettingsTabKey; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Target Role & Profile", icon: User },
    { key: "ai", label: "AI Interviewer Persona", icon: Bot },
    { key: "canvas", label: "Whiteboard & Canvas", icon: Layout },
    { key: "preferences", label: "Goals & Notifications", icon: BellRing },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Workspace Settings
            </h1>
            {isServerLoading && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Customize target level calibrations, AI interviewer rigor, and whiteboarding preferences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
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
        </div>
      </div>
    </div>
  );
}
