"use client";

import React from "react";
import { ArrowRight, Layers, Shield, Zap, Database, Sliders } from "lucide-react";
import type { QuizDeck } from "../types";

interface QuizDeckCardsProps {
  decks: QuizDeck[];
  onStartDeck: (deck: QuizDeck) => void;
}

export function QuizDeckCards({ decks, onStartDeck }: QuizDeckCardsProps) {
  const getDeckIcon = (iconName: string) => {
    switch (iconName) {
      case "Shield":
        return Shield;
      case "Zap":
        return Zap;
      case "Database":
        return Database;
      case "Sliders":
        return Sliders;
      default:
        return Layers;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            System Design Topic Decks
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Targeted problem sets for rapid concept retention and interview drill-downs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decks.map((deck) => {
          const Icon = getDeckIcon(deck.iconName);
          const diffColor =
            deck.difficulty === "senior"
              ? "text-rose-600 dark:text-rose-400"
              : "text-amber-600 dark:text-amber-400";

          return (
            <div
              key={deck.id}
              className="p-6 bg-white dark:bg-[#111318] border border-zinc-200/80 dark:border-zinc-800/80 rounded-xl shadow-xs flex flex-col justify-between space-y-4 hover:border-primary/50 group transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 text-xs font-medium uppercase rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50 ${diffColor}`}>
                      {deck.difficulty}
                    </span>
                    <span className="px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      {deck.estMinutes} mins
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-primary transition-colors">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {deck.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400">
                    {deck.questionCount} Questions
                  </span>
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
                    {deck.completedPercent}% mastered
                  </span>
                </div>

                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${deck.completedPercent}%` }}
                  />
                </div>

                <button
                  onClick={() => onStartDeck(deck)}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-zinc-100 dark:text-zinc-900 font-bold text-xs rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  Launch Quiz Deck <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
