"use client";

import React from "react";
import { 
  AlertTriangle, 
  AlertOctagon, 
  ShieldAlert, 
  Lightbulb, 
  FileText, 
  MessageSquare, 
  Layers, 
  Calculator,
  CheckCircle2
} from "lucide-react";
import type { PitfallInsight } from "../types";

interface PitfallInsightsProps {
  pitfalls: PitfallInsight[];
}

interface NormalizedPitfall {
  id: string;
  category: "critical" | "warning" | "tip";
  domainTag: string;
  headline: string;
  finding: string;
  remedy: string;
  impactLevel: "High Priority" | "Medium Priority" | "Advisory";
  icon: React.ElementType;
}

function processPitfalls(raw: PitfallInsight[]): NormalizedPitfall[] {
  if (!raw || raw.length === 0) return [];

  const seenDomains = new Set<string>();
  const results: NormalizedPitfall[] = [];

  for (const item of raw) {
    const rawText = (item.title || item.description || "").trim();
    if (!rawText) continue;

    const lower = rawText.toLowerCase();
    let domainTag = "Architecture";
    let headline = "System Design Gap";
    let remedy = "Anchor designs around clear requirements, failure recovery, and trade-off evaluations.";
    let icon = Layers;
    let impactLevel: "High Priority" | "Medium Priority" | "Advisory" = "Medium Priority";
    let category: "critical" | "warning" | "tip" = item.category || "warning";

    if (lower.includes("communication") || lower.includes("structure") || lower.includes("refusal")) {
      domainTag = "Communication";
      headline = "Structural Cadence & Dialogue";
      remedy = "Vocalize technical trade-offs in real time. State assumptions explicitly before placing whiteboard components.";
      icon = MessageSquare;
      impactLevel = "High Priority";
      category = "critical";
    } else if (lower.includes("requirement") || lower.includes("scope") || lower.includes("inability to define")) {
      domainTag = "Scoping";
      headline = "Requirements & Scope Framing";
      remedy = "Always establish functional vs. non-functional requirements (QPS, throughput, p99 latency) during the first 5 minutes.";
      icon = FileText;
      impactLevel = "High Priority";
      category = "critical";
    } else if (lower.includes("distributed") || lower.includes("knowledge") || lower.includes("absence")) {
      domainTag = "Distributed Systems";
      headline = "Core Distributed Architecture";
      remedy = "Incorporate standard architectural tiers: load balancing, caching (Redis), asynchronous queues (Kafka), and read replicas.";
      icon = Layers;
      impactLevel = "High Priority";
      category = "critical";
    } else if (lower.includes("capacity") || lower.includes("estimate") || lower.includes("sizing")) {
      domainTag = "Capacity";
      headline = "Capacity & Traffic Estimation";
      remedy = "Provide quick back-of-the-envelope numbers: storage volume over 5 years, memory caching requirements, and peak read/write bandwidth.";
      icon = Calculator;
      impactLevel = "Medium Priority";
      category = "warning";
    } else if (lower.includes("single point") || lower.includes("failover") || lower.includes("resilien")) {
      domainTag = "Resilience";
      headline = "Single Point of Failure (SPOF)";
      remedy = "Ensure every critical path component has redundant instances, health check probes, and automated failover policies.";
      icon = AlertOctagon;
      impactLevel = "High Priority";
      category = "critical";
    }

    // Deduplicate so we don't spam repeated items of the same domain
    if (seenDomains.has(domainTag) && results.length >= 3) {
      continue;
    }
    seenDomains.add(domainTag);

    // Clean up finding text to prevent repeating identical title/description
    let findingText = rawText;
    if (findingText.endsWith(".")) {
      findingText = findingText.slice(0, -1);
    }

    results.push({
      id: item.id,
      category,
      domainTag,
      headline,
      finding: findingText,
      remedy,
      impactLevel,
      icon,
    });

    if (results.length >= 4) break;
  }

  return results;
}

export function PitfallInsights({ pitfalls }: PitfallInsightsProps) {
  const normalized = processPitfalls(pitfalls);

  return (
    <div className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              Automated Pitfall &amp; Antipattern Detection
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Targeted architectural diagnosis and remediation steps derived from session telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Analysis Engine Active
          </span>
        </div>
      </div>

      {/* Grid of Clean Architecture Cards */}
      {normalized.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {normalized.map((item) => {
            const Icon = item.icon;
            const isCritical = item.category === "critical";

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isCritical
                    ? "bg-zinc-50/70 dark:bg-zinc-900/40 border-rose-200/60 dark:border-rose-900/30 hover:border-rose-300 dark:hover:border-rose-800/60"
                    : "bg-zinc-50/70 dark:bg-zinc-900/40 border-amber-200/60 dark:border-amber-900/30 hover:border-amber-300 dark:hover:border-amber-800/60"
                }`}
              >
                {/* Card Top: Category Pill + Impact Pill */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    <Icon className={`h-3.5 w-3.5 ${isCritical ? "text-rose-500" : "text-amber-500"}`} />
                    <span>{item.headline}</span>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-medium border ${
                    isCritical 
                      ? "text-rose-600 dark:text-rose-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200/50 dark:border-zinc-700/50" 
                      : "text-amber-600 dark:text-amber-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200/50 dark:border-zinc-700/50"
                  }`}>
                    {item.impactLevel}
                  </span>
                </div>

                {/* Card Middle: Observed Finding */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block">
                    Observed Pattern
                  </span>
                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                    {item.finding}
                  </p>
                </div>

                {/* Card Bottom: Actionable Remedy */}
                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 space-y-1 bg-white/50 dark:bg-zinc-950/30 p-2.5 rounded-lg">
                  <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    <Lightbulb className="h-3 w-3" />
                    <span>Recommended Architectural Action</span>
                  </div>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.remedy}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty / Clear State */
        <div className="p-8 text-center rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-teal-500/10 text-teal-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              No Critical Antipatterns Detected
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              Your recent designs followed standard architectural conventions. Continue practicing to maintain consistency.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

