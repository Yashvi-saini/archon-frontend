"use client";

import React from "react";
import { AuthLayout, ResetPasswordForm } from "@/features/auth";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Create a strong, secure new password for your Archon developer account."
      illustrationSrc="/illustrations/Reset password-amico.svg"
      illustrationAlt="Reset Password Illustration"
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
