"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { forgotPassword } from "../api/auth";
import { validateEmail } from "../utils/validators";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean }>({});

  const validate = (val: string) => {
    const err = validateEmail(val);
    setErrors({ email: err || undefined });
    return err;
  };

  const handleBlur = () => {
    setTouched({ email: true });
    validate(email);
  };

  const handleChange = (val: string) => {
    setEmail(val);
    if (touched.email) {
      validate(val);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setTouched({ email: true });
    const emailErr = validate(email);
    if (emailErr) {
      return;
    }

    setIsLoading(true);
    const response = await forgotPassword(email);
    setIsLoading(false);

    if (response.success) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_temp_email", email);
      }
      toast.success("OTP sent to registered mail");
      router.push("/verify-reset-otp");
    } else {
      setError(response.error || "Failed to process request. Please try again.");
    }
  };

  return (
    <div className="w-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Back Button */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-85 transition-opacity mb-6 group w-fit cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
        Back to Login
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Forgot Password</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter your email address and we will send you a verification code to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRequestSubmit} className="flex flex-col gap-5">
        
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              touched.email && errors.email ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter email"
            className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border rounded-lg text-sm text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 transition-all ${
              touched.email && errors.email
                ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 focus:border-primary"
            }`}
          />
          {touched.email && errors.email && (
            <p className="text-xs font-semibold text-rose-500 mt-0.5">{errors.email}</p>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 py-3 px-4 bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            "Send OTP"
          )}
        </button>

      </form>

    </div>
  );
}
