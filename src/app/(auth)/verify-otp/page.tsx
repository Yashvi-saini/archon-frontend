"use client";

import React, { Suspense } from "react";
import { AuthLayout, VerifyOtpForm } from "@/features/auth";

function VerifyOtpContent() {
  return (
    <AuthLayout
      title="Confirm your identity to secure your workspace."
      subtitle="Please enter the verification code sent to your email to complete verification."
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
