import React, { Suspense } from "react";
import { InterviewWorkspace } from "@/features/interview";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function InterviewWorkspacePage({ params }: PageProps) {
  const resolvedParams = await params;
  const sessionId = resolvedParams.id;

  return (
    <Suspense fallback={null}>
      <InterviewWorkspace sessionId={sessionId} />
    </Suspense>
  );
}
