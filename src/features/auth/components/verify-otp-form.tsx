"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get("action") || "verify"; // 'verify' or 'reset'
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulated OTP verification
    setTimeout(() => {
      setIsLoading(false);
      if (action === "reset") {
        alert("OTP verified successfully! Please enter your new password.");
        router.push("/reset-password");
      } else {
        alert("Account verified successfully! You can now log in.");
        router.push("/login");
      }
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-85 transition-opacity mb-6 group w-fit cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Verify OTP</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          We have sent a 6-digit verification code to your registered email address.
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleOtpVerify} className="flex flex-col gap-5">
        
        {/* OTP Code */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="otp"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
          >
            Verification Code (OTP)
          </label>
          <input
            id="otp"
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-lg text-center tracking-[0.5em] font-mono text-foreground placeholder-zinc-300 dark:placeholder-zinc-700 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || otp.length < 6}
          className="w-full mt-4 py-3 px-4 bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            "Verify OTP"
          )}
        </button>

        {/* Resend Link */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            className="font-semibold text-primary hover:underline cursor-pointer"
            onClick={() => alert("OTP resent successfully!")}
          >
            Resend Code
          </button>
        </div>

      </form>

    </div>
  );
}
