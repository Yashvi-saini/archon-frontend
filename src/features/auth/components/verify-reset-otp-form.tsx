"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { verifyResetOtp, resendOtp } from "../api/auth";
import { toast } from "sonner";
import { validateOtp } from "../utils/validators";

export function VerifyResetOtpForm() {
  const router = useRouter();
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ otp?: string }>({});
  const [touched, setTouched] = useState<{ otp?: boolean }>({});
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tempEmail = sessionStorage.getItem("auth_temp_email");
      if (!tempEmail) {
        setError("No active reset session. Please return to forgot password page and try again.");
      } else {
        setEmail(tempEmail);
      }
    }
  }, []);

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending || !email) return;

    setIsResending(true);
    setError("");
    const response = await resendOtp(email, "forgot_password");
    setIsResending(false);

    if (response.success) {
      toast.success("Verification code resent successfully!");
      setResendCooldown(60);
    } else {
      setError(response.error || "Failed to resend verification code. Please try again.");
    }
  };

  const validate = (val: string) => {
    const err = validateOtp(val);
    setErrors({ otp: err || undefined });
    return err;
  };

  const handleBlur = () => {
    setTouched({ otp: true });
    validate(otp);
  };

  const handleChange = (val: string) => {
    setOtp(val);
    if (touched.otp || val.length >= 6) {
      validate(val);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email address is missing. Please restart the process.");
      return;
    }

    setTouched({ otp: true });
    const otpErr = validate(otp);
    if (otpErr) {
      return;
    }

    setIsLoading(true);
    const response = await verifyResetOtp(email, otp);
    setIsLoading(false);

    if (response.success) {
      // Find reset_token at top-level or under data
      const resetToken = response.reset_token || response.data?.reset_token;
      if (!resetToken) {
        setError("Failed to retrieve reset token. Please try again.");
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_reset_token", resetToken);
      }
      toast.success("OTP verified successfully!");
      router.push("/reset-password");
    } else {
      setError(response.error || "Invalid verification code. Please try again.");
    }
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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Verify Reset OTP</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Please enter the 6-digit verification code sent to your registered email address to reset your password.
        </p>
      </div>

      {/* OTP Form */}
      <form onSubmit={handleOtpVerify} className="flex flex-col gap-5">
        
        {/* OTP Code */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="otp"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              touched.otp && errors.otp ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Verification Code (OTP)
          </label>
          <input
            id="otp"
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => handleChange(e.target.value.replace(/\D/g, ""))}
            onBlur={handleBlur}
            placeholder="••••••"
            className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border rounded-lg text-lg text-center tracking-[0.5em] font-mono text-foreground placeholder-zinc-300 dark:placeholder-zinc-700 focus:outline-hidden focus:ring-2 transition-all ${
              touched.otp && errors.otp
                ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 focus:border-primary"
            }`}
          />
          {touched.otp && errors.otp && (
            <p className="text-xs font-semibold text-rose-500 mt-0.5 text-center">{errors.otp}</p>
          )}
        </div>

        {/* Error Message */}
        {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading || otp.length < 6}
          className="w-full mt-4 py-3 px-4 bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            "Verify Code"
          )}
        </button>

        {/* Resend Link */}
        <div className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            disabled={resendCooldown > 0 || isResending}
            className="font-semibold text-primary hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
            onClick={handleResend}
          >
            {isResending ? "Resending..." : resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : "Resend Code"}
          </button>
        </div>

      </form>

    </div>
  );
}
