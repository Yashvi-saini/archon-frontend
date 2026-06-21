"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulated request to generate OTP
    setTimeout(() => {
      setIsLoading(false);
      router.push("/verify-otp?action=reset");
    }, 1500);
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
        <h1 className="text-3xl font-bold tracking-tight">Forgot Password</h1>
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
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

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
