"use client";

import React, { Suspense } from "react";
import { AuthLayout, VerifyResetOtpForm } from "@/features/auth";
function VerifyResetOtpContent() {
  return (
    <AuthLayout
      title="Confirm Reset OTP"
      subtitle="Enter the secure verification code sent to your email to authorize password reset."
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
