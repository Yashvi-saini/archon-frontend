"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2, Flame, Calendar as CalendarIcon, Clock } from "lucide-react";
import { useQuizRewards } from "../hooks/use-quiz-rewards";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function DailyStreakCalendar() {
  const { rewards } = useQuizRewards();

  // Navigation month state (defaults to current date)
  const [viewDate, setViewDate] = useState(() => new Date());
  const now = useMemo(() => new Date(), []);
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const isCurrentMonthView = now.getFullYear() === year && now.getMonth() === month;

  // Month labels
  const monthName = viewDate.toLocaleString("default", { month: "long" });

  // Live countdown timer to end of day (midnight)
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const current = new Date();
      const endOfDay = new Date(current.getFullYear(), current.getMonth(), current.getDate(), 23, 59, 59, 999);
      const diff = Math.max(0, endOfDay.getTime() - current.getTime());
      const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
      const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
      const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0");
      return `${hours}:${minutes}:${seconds} left`;
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Month navigation
  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(1);
  };

  const handleGoToday = () => {
    setViewDate(new Date());
    setSelectedDay(now.getDate());
  };

  // Days matrix for current month view
  const { emptyLeadingSlots, currentDays } = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let day = 1; day <= totalDays; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isCompleted = rewards.completedDates?.includes(dateKey) ?? false;
      const isToday = isCurrentMonthView && day === now.getDate();
      const dayEnd = new Date(year, month, day, 23, 59, 59).getTime();
      const isPast = dayEnd < now.getTime() && !isToday;
      const isFuture = !isToday && !isPast;

      days.push({
        day,
        dateKey,
        isCompleted,
        isToday,
        isPast,
        isFuture,
      });
    }

    return {
      emptyLeadingSlots: firstDayIndex,
      currentDays: days,
    };
  }, [year, month, rewards.completedDates, isCurrentMonthView, now]);

  // Selected date details
  const selectedDateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
  const isSelectedCompleted = rewards.completedDates?.includes(selectedDateKey);
  const isSelectedToday = isCurrentMonthView && selectedDay === now.getDate();
  const isSelectedPast = new Date(year, month, selectedDay, 23, 59, 59).getTime() < now.getTime() && !isSelectedToday;

  return (
    <div className="p-5 bg-[#262626] dark:bg-[#1a1a1a] border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl shadow-sm text-zinc-100 max-w-sm w-full transition-all">
      {/* Top Header: Day X + Countdown Timer + Clean Month Navigator (NO 9 SEP badge) */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-zinc-900 dark:text-white">
            Day {selectedDay}
          </span>
          {isSelectedToday && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono font-normal">
              {timeLeft}
            </span>
          )}
        </div>

        {/* Clean Month Navigator with < Month Year > */}
        <div className="flex items-center gap-1">
          {!isCurrentMonthView && (
            <button
              onClick={handleGoToday}
              className="px-2 py-0.5 rounded-full text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors cursor-pointer mr-0.5"
              title="Jump to Current Month"
            >
              Today
            </button>
          )}
          <button
            onClick={handlePrevMonth}
            className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white p-1 transition-colors cursor-pointer rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 min-w-[95px] text-center select-none">
            {monthName} {year}
          </span>
          <button
            onClick={handleNextMonth}
            className="text-zinc-400 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white p-1 transition-colors cursor-pointer rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekdays Labels: S M T W T F S */}
      <div className="grid grid-cols-7 text-center pt-3 pb-2">
        {WEEKDAYS.map((d, i) => (
          <span
            key={i}
            className="text-xs font-semibold text-zinc-500 dark:text-zinc-500 select-none"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid - Fully Interactive Buttons */}
      <div className="grid grid-cols-7 gap-y-2.5 place-items-center">
        {/* Empty slots for days before 1st of month */}
        {[...Array(emptyLeadingSlots)].map((_, i) => (
          <div key={`empty-${i}`} className="w-8 h-8" />
        ))}

        {/* Days of Month */}
        {currentDays.map((item) => {
          const isSelected = selectedDay === item.day;

          if (item.isCompleted) {
            // Solved Day: Solid Green Circle with White Day Number
            return (
              <button
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                title={`${monthName} ${item.day}: Daily Challenge Solved ✔`}
                className={`w-8 h-8 rounded-full bg-[#22c55e] hover:bg-[#1ea750] text-white font-bold flex items-center justify-center text-xs shadow-sm transition-all cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-white dark:ring-zinc-100 ring-offset-2 ring-offset-[#262626] dark:ring-offset-[#1a1a1a] scale-110"
                    : "hover:scale-105"
                }`}
              >
                {item.day}
              </button>
            );
          }

          if (item.isToday) {
            // Today (not yet completed): Green Ring Highlight
            return (
              <button
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                title={`${monthName} ${item.day}: Today's Challenge (Pending)`}
                className={`w-8 h-8 rounded-full border-2 border-[#22c55e] text-zinc-900 dark:text-white font-bold flex items-center justify-center text-xs shadow-sm transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#22c55e]/20 ring-2 ring-[#22c55e] ring-offset-2 ring-offset-[#262626] dark:ring-offset-[#1a1a1a] scale-110"
                    : "hover:bg-[#22c55e]/10 hover:scale-105"
                }`}
              >
                {item.day}
              </button>
            );
          }

          if (item.isPast) {
            // Past Missed Day: Day number with reddish/orange dot below
            return (
              <button
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                title={`${monthName} ${item.day}: Missed Daily Challenge`}
                className={`flex flex-col items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer ${
                  isSelected
                    ? "bg-zinc-700/60 ring-2 ring-zinc-400 ring-offset-2 ring-offset-[#262626] dark:ring-offset-[#1a1a1a]"
                    : "hover:bg-zinc-700/40"
                }`}
              >
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 leading-none">
                  {item.day}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1" />
              </button>
            );
          }

          // Future Day: Faint day number, no dot
          return (
            <button
              key={item.day}
              onClick={() => setSelectedDay(item.day)}
              title={`${monthName} ${item.day}: Upcoming Challenge`}
              className={`flex flex-col items-center justify-center w-8 h-8 rounded-full transition-all cursor-pointer ${
                isSelected
                  ? "bg-zinc-700/60 ring-2 ring-zinc-400 ring-offset-2 ring-offset-[#262626] dark:ring-offset-[#1a1a1a]"
                  : "hover:bg-zinc-700/30"
              }`}
            >
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 leading-none">
                {item.day}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Selected Day Details Box */}
      <div className="pt-3 mt-3 border-t border-zinc-200/40 dark:border-zinc-800/80">
        {isSelectedCompleted ? (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 text-xs">
            <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0" />
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">
              {monthName} {selectedDay}: <span className="text-[#22c55e] font-semibold">Challenge Solved!</span> (+10 Coins earned)
            </span>
          </div>
        ) : isSelectedToday ? (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 text-xs">
            <Flame className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="text-zinc-800 dark:text-zinc-200 font-medium">
              Today&apos;s challenge is active! <span className="text-amber-500 font-semibold">Solve it to maintain streak.</span>
            </span>
          </div>
        ) : isSelectedPast ? (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-400 dark:text-zinc-400">
            <CalendarIcon className="h-4 w-4 text-zinc-500 shrink-0" />
            <span>No challenge completed on {monthName} {selectedDay}.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/60 dark:border-zinc-700/60 text-xs text-zinc-400 dark:text-zinc-400">
            <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
            <span>Upcoming challenge on {monthName} {selectedDay}.</span>
          </div>
        )}
      </div>

      {/* Subtle LeetCode Bottom Info Row: Streak & Coins */}
      <div className="flex items-center justify-between pt-2.5 text-[11px] text-zinc-400 dark:text-zinc-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22c55e] shrink-0" />
          <span>{rewards.streakDays} Day Streak</span>
        </div>
        <span>{rewards.coins} Archon Coins</span>
      </div>
    </div>
  );
}
