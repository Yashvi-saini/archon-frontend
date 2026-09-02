"use client";

import React from "react";
import type { UserSettings, InterviewerStrictness } from "../types";

interface InterviewerAiTabProps {
  settings: UserSettings;
  onChange: (updated: Partial<UserSettings>) => void;
}

export function InterviewerAiTab({ settings, onChange }: InterviewerAiTabProps) {
  const strictnessLevels: { key: InterviewerStrictness; title: string; desc: string }[] = [
    {
      key: "supportive",
      title: "Supportive Mentor",
      desc: "Gentle prompts, constructive hints when stuck, focus on building confidence and pattern recognition.",
    },
    {
      key: "standard",
      title: "Standard FAANG Interviewer",
      desc: "Neutral demeanor, asks probing questions on trade-offs, expects candidate to drive requirements and estimation.",
    },
    {
      key: "rigorous",
      title: "Rigorous Staff Bar Raiser",
      desc: "Interrupts premature optimizations, stresses edge-case network partitions, and demands deep failure mode defenses.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            AI Interviewer Demeanor & Strictness
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Controls how aggressively the AI challenges your architectural assumptions during live whiteboarding
          </p>
        </div>

        <div className="space-y-3">
          {strictnessLevels.map((lvl) => {
            const isSelected = settings.interviewerStrictness === lvl.key;
            return (
              <div
                key={lvl.key}
                onClick={() => onChange({ interviewerStrictness: lvl.key })}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 text-zinc-900 dark:text-zinc-50"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{lvl.title}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                  {lvl.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Interactivity & Guidance
        </h4>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
            <div className="space-y-0.5 max-w-md">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                Proactive Architectural Hints
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                AI will suggest investigating missing components (e.g. caches, load balancers) if omitted after 10 minutes.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.enableProactiveHints}
              onChange={(e) => onChange({ enableProactiveHints: e.target.checked })}
              className="h-4 w-4 rounded accent-primary cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
            <div className="space-y-0.5 max-w-md">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                Audio Voice Synthesizer
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Play interviewer responses via neural text-to-speech for realistic mock phone screen simulation.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.enableVoiceInterview}
              onChange={(e) => onChange({ enableVoiceInterview: e.target.checked })}
              className="h-4 w-4 rounded accent-primary cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
