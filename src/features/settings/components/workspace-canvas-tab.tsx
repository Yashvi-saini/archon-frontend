"use client";

import React from "react";
import type { UserSettings, CanvasGridType } from "../types";
import { Grid, Square, CircleDot } from "lucide-react";

interface WorkspaceCanvasTabProps {
  settings: UserSettings;
  onChange: (updated: Partial<UserSettings>) => void;
}

export function WorkspaceCanvasTab({ settings, onChange }: WorkspaceCanvasTabProps) {
  const gridTypes: { key: CanvasGridType; label: string; icon: React.ElementType }[] = [
    { key: "dots", label: "Dot Matrix", icon: CircleDot },
    { key: "grid", label: "Grid Lines", icon: Grid },
    { key: "blank", label: "Blank Infinite", icon: Square },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Default Whiteboard Grid Pattern
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Select the default background topology for the Excalidraw interview canvas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {gridTypes.map((gt) => {
            const Icon = gt.icon;
            const isSelected = settings.canvasGridType === gt.key;
            return (
              <div
                key={gt.key}
                onClick={() => onChange({ canvasGridType: gt.key })}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? "border-primary bg-primary/5 text-zinc-900 dark:text-zinc-50"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{gt.label}</span>
                </div>
                {isSelected && <span className="w-2 h-2 rounded-full bg-primary" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 flex items-center justify-between">
          <div className="space-y-0.5 max-w-[240px]">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
              Snap to Grid Alignment
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Align boxes and message brokers to 8px grid automatically.
            </span>
          </div>
          <input
            type="checkbox"
            checked={settings.snapToGrid}
            onChange={(e) => onChange({ snapToGrid: e.target.checked })}
            className="h-4 w-4 rounded accent-primary cursor-pointer"
          />
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 space-y-1.5">
          <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
            Auto-Save Cloud Sync Interval
          </label>
          <select
            value={settings.autoSaveIntervalSeconds}
            onChange={(e) => onChange({ autoSaveIntervalSeconds: Number(e.target.value) })}
            className="w-full px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/40"
          >
            <option value={10}>Every 10 seconds (High frequency)</option>
            <option value={15}>Every 15 seconds (Recommended)</option>
            <option value={30}>Every 30 seconds</option>
            <option value={60}>Every 60 seconds</option>
          </select>
          <span className="text-[10px] text-zinc-400">
            Saves drawing nodes to backend Postgres diagram table.
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
          Default Architecture Diagram Export Format
        </label>
        <div className="flex gap-3">
          {(["svg", "png", "json"] as const).map((fmt) => (
            <label
              key={fmt}
              className={`flex-1 p-3 rounded-lg border text-xs cursor-pointer text-center uppercase font-mono font-bold transition-all ${
                settings.exportFormat === fmt
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 text-zinc-500"
              }`}
            >
              <input
                type="radio"
                name="exportFormat"
                value={fmt}
                checked={settings.exportFormat === fmt}
                onChange={() => onChange({ exportFormat: fmt })}
                className="sr-only"
              />
              .{fmt}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
