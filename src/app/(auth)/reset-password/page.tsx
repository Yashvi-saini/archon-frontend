"use client";

import React, { Suspense } from "react";
import { AuthLayout, ResetPasswordForm } from "@/features/auth";

function ResetPasswordContent() {
  return (
    <AuthLayout
      title="Choose a secure password and get back to mastering system design."
      subtitle="Follow the security guidelines to update your credentials and access your design panels."
      illustrationSrc="/illustrations/Reset password-amico.svg"
      illustrationAlt="Reset Password Illustration"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
