"use client";

import React from "react";
import type { UserSettings } from "../types";

interface PreferencesTabProps {
  settings: UserSettings;
  onChange: (updated: Partial<UserSettings>) => void;
}

export function PreferencesTab({ settings, onChange }: PreferencesTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Weekly Interview Practice Target
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Set your target cadence of full mock sessions per week to maintain readiness velocity
          </p>
        </div>

        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map((target) => (
            <button
              key={target}
              type="button"
              onClick={() => onChange({ weeklyInterviewTarget: target })}
              className={`flex-1 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                settings.weeklyInterviewTarget === target
                  ? "border-primary bg-primary text-white"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {target} {target === 1 ? "session" : "sessions"} / wk
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Email & Digest Notifications
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
            <div className="space-y-0.5 max-w-md">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                Practice Reminders
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Receive subtle calendar reminders when you are 1 session away from missing your weekly goal.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => onChange({ emailNotifications: e.target.checked })}
              className="h-4 w-4 rounded accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
            <div className="space-y-0.5 max-w-md">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                Weekly AI Performance Digest
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Summary of rubric scores, strengths identified, and architecture topics to review every Sunday.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.weeklyReportDigest}
              onChange={(e) => onChange({ weeklyReportDigest: e.target.checked })}
              className="h-4 w-4 rounded accent-primary cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
