"use client";

import React from "react";
import { RadialScoreGauge } from "@/components/ui/svg-charts";
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Clock, Info } from "lucide-react";

interface ReadinessIndexGaugeProps {
  score: number;
  percentile: number;
  targetLevel: string;
}

export function ReadinessIndexGauge({ score, percentile, targetLevel }: ReadinessIndexGaugeProps) {
  // Dynamically evaluate peer standing without dummy or misleading phrases
  const getPeerStanding = () => {
    if (score === 0) {
      return {
        title: "Uncalibrated",
        subtitle: "Complete mock sessions to establish ranking",
      };
    }
    if (score <= 20) {
      return {
        title: "Foundational Tier",
        subtitle: `Calibrating baseline · ${score}/100 pts`,
      };
    }
    if (score < 50) {
      return {
        title: "Developing Tier",
        subtitle: percentile > 0 ? `${percentile}th percentile` : "Baseline in progress",
      };
    }
    if (score < 75) {
      const topPct = Math.max(1, 100 - percentile);
      return {
        title: "Intermediate Tier",
        subtitle: `Top ${topPct}% of candidates`,
      };
    }
    const topPct = Math.max(1, 100 - percentile);
    return {
      title: "Top Tier Candidate",
      subtitle: `Top ${topPct}% of candidates`,
    };
  };

  // Dynamically evaluate readiness badge
  const getStatusPill = () => {
    const levelName = targetLevel ? targetLevel.replace(" Software Engineer", "") : "Target";

    if (score === 0) {
      return {
        text: "Initial Assessment Pending",
        icon: Info,
        textColor: "text-zinc-500 dark:text-zinc-400",
        dotColor: "bg-zinc-400",
      };
    }
    if (score < 25) {
      return {
        text: "Needs Foundational Practice",
        icon: AlertTriangle,
        textColor: "text-rose-600 dark:text-rose-400",
        dotColor: "bg-rose-500",
      };
    }
    if (score < 50) {
      return {
        text: "Core Competency Developing",
        icon: Clock,
        textColor: "text-amber-600 dark:text-amber-400",
        dotColor: "bg-amber-500",
      };
    }
    if (score < 75) {
      return {
        text: `Approaching ${levelName} Bar`,
        icon: TrendingUp,
        textColor: "text-sky-600 dark:text-sky-400",
        dotColor: "bg-sky-500",
      };
    }
    return {
      text: `Ready for ${levelName} Loop`,
      icon: CheckCircle2,
      textColor: "text-teal-600 dark:text-teal-400",
      dotColor: "bg-teal-500",
    };
  };

  const peerStanding = getPeerStanding();
  const statusPill = getStatusPill();
  const StatusIcon = statusPill.icon;

  const gaugeColor = 
    score >= 75 ? "text-teal-500" :
    score >= 45 ? "text-amber-500" :
    score > 0 ? "text-[#BA68C8]" : "text-zinc-400";

  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs flex flex-col justify-between space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            Architecture Readiness Index
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Probabilistic readiness score for Tier-1 system design interview loops
          </p>
        </div>
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
          <Target className="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
        <RadialScoreGauge
          value={score}
          size={140}
          strokeWidth={12}
          label="Readiness"
          sublabel="Scale 0-100"
          colorClassName={gaugeColor}
        />

        <div className="space-y-3 text-center sm:text-left">
          <div>
            <span className="text-xs text-zinc-400 block font-medium">Peer Standing</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {peerStanding.title}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-mono mt-0.5">
              {peerStanding.subtitle}
            </span>
          </div>

          <div>
            <span className="text-xs text-zinc-400 block font-medium">Target Calibration</span>
            <span className="text-xs font-semibold text-primary">
              {targetLevel || "Senior Software Engineer"}
            </span>
          </div>

          {/* Dynamic LeetCode Styled Status Capsule */}
          <div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 ${statusPill.textColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusPill.dotColor}`} />
              <StatusIcon className="h-3 w-3" />
              <span>{statusPill.text}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-center sm:text-left">
        <p className="text-[11px] text-zinc-400">
          Calibrated dynamically from whiteboard topological accuracy, latency estimations, and trade-off depth.
        </p>
      </div>
    </div>
  );
}
