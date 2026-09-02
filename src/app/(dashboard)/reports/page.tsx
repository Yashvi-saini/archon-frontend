"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { ReportsView } from "@/features/reports";

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
        </div>
      }
    >
      <ReportsView />
    </Suspense>
  );
}
