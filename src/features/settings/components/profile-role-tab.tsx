"use client";

import React from "react";
import type { UserSettings, EngineeringLevel } from "../types";
import { TARGET_COMPANIES_LIST, TECH_STACKS_LIST } from "../constants";

interface ProfileRoleTabProps {
  settings: UserSettings;
  onChange: (updated: Partial<UserSettings>) => void;
}

export function ProfileRoleTab({ settings, onChange }: ProfileRoleTabProps) {
  const levels: { key: EngineeringLevel; label: string; desc: string }[] = [
    { key: "mid", label: "Mid-Level (L4)", desc: "1-3 yrs experience, focus on API design and data models" },
    { key: "senior", label: "Senior (L5)", desc: "4-8 yrs experience, focus on sharding, caching, fault tolerance" },
    { key: "staff", label: "Staff (L6)", desc: "8+ yrs experience, multi-datacenter, distributed consensus, org-level trade-offs" },
    { key: "principal", label: "Principal (L7+)", desc: "Industry-defining architectures, extreme scale, paradigm shifts" },
  ];

  const toggleCompany = (company: string) => {
    const current = settings.targetCompanies;
    const exists = current.includes(company);
    const updated = exists ? current.filter((c) => c !== company) : [...current, company];
    onChange({ targetCompanies: updated });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Target Engineering Level
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Calibrates the AI interviewer difficulty, scoring rubric strictness, and problem expectations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {levels.map((lvl) => {
            const isSelected = settings.targetLevel === lvl.key;
            return (
              <div
                key={lvl.key}
                onClick={() => onChange({ targetLevel: lvl.key })}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all space-y-1 ${
                  isSelected
                    ? "border-primary bg-primary/5 text-zinc-900 dark:text-zinc-50"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{lvl.label}</span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {lvl.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Primary Language / Ecosystem
          </label>
          <select
            value={settings.primaryStack}
            onChange={(e) => onChange({ primaryStack: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/40"
          >
            {TECH_STACKS_LIST.map((stack) => (
              <option key={stack} value={stack}>
                {stack}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-400">
            The AI will frame code snippets and concurrency primitives in this ecosystem.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Years of Engineering Experience
          </label>
          <input
            type="number"
            min="0"
            max="30"
            value={settings.yearsOfExperience}
            onChange={(e) => onChange({ yearsOfExperience: Number(e.target.value) })}
            className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/40"
          />
          <p className="text-[11px] text-zinc-400">
            Helps calibrate communication and depth expectations.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
            Target Companies & Interview Formats
          </label>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Select companies you are targeting to skew question scenarios toward their actual question styles
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TARGET_COMPANIES_LIST.map((company) => {
            const isSelected = settings.targetCompanies.includes(company);
            return (
              <button
                key={company}
                type="button"
                onClick={() => toggleCompany(company)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                {company}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
