"use client";

import React from "react";
import { AuthLayout, ForgotPasswordForm } from "@/features/auth";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="No worries, we will send you security instructions to safely reset your password."
      illustrationSrc="/illustrations/Forgot password-amico.svg"
      illustrationAlt="Forgot Password Illustration"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
