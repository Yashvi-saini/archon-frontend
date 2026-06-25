"use client";

import React from "react";

export default function ReportsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-205">
      <div>
        <h1 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50">Reports</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          AI review feedback and scoring reports.
        </p>
      </div>

      <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center bg-white dark:bg-[#111318]">
        <p className="text-sm text-zinc-450 dark:text-zinc-500">Detailed scoring reports will be initialized here.</p>
      </div>
    </div>
  );
}
