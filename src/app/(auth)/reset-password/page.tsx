"use client";

import React from "react";
import { AuthLayout, ResetPasswordForm } from "@/features/auth";

export default function ResetPasswordPage() {
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
