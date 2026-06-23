"use client";

import React, { Suspense } from "react";
import { AuthLayout, VerifyResetOtpForm } from "@/features/auth";
function VerifyResetOtpContent() {
  return (
    <AuthLayout
      title="Verify verification code."
      subtitle="Enter the code sent to your registered email to set a new password."
      illustrationSrc="/illustrations/Enter OTP-amico.svg"
      illustrationAlt="Verify Reset OTP"
    >
      <VerifyResetOtpForm />
    </AuthLayout>
  );
}

export default function VerifyResetOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>}>
      <VerifyResetOtpContent />
    </Suspense>
  );
}
