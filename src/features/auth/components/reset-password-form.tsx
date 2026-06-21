"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    // Simulated Password Reset API
    setTimeout(() => {
      setIsLoading(false);
      alert("Success! Your password has been updated.");
      router.push("/login");
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.push("/login")}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-85 transition-opacity mb-6 group w-fit cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
        Cancel
      </button>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Password</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Create a secure new password for your account.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
        
        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors cursor-pointer"
            >
              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Error Message */}
        {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            "Reset Password"
          )}
        </button>

      </form>

    </div>
  );
}
