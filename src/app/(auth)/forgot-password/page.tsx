"use client";

import React from "react";
import { AuthLayout, ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="No worries, we've got you covered. Let's restore your access."
      subtitle="Follow the step-by-step security checks to verify your identity and safely update your system design platform credentials."
      illustrationSrc="/illustrations/Forgot password-amico.svg"
      illustrationAlt="Forgot Password Illustration"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
