"use client";

import React, { Suspense } from "react";
import { AuthLayout, VerifyOtpForm } from "@/features/auth";

function VerifyOtpContent() {
  return (
    <AuthLayout
      title="Verify Identity"
      subtitle="Enter the secure 6-digit verification code sent to your registered email."
      illustrationSrc="/illustrations/Enter OTP-amico.svg"
      illustrationAlt="Enter OTP Illustration"
    >
      <VerifyOtpForm />
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
