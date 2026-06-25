import React from "react";
import { InterviewWorkspace } from "@/features/interview";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function InterviewWorkspacePage({ params }: PageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  return <InterviewWorkspace problemId={id} />;
}
