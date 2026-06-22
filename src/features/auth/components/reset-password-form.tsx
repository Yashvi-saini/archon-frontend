"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { resetPassword } from "../api/auth";
import { toast } from "sonner";
import { validatePassword, validateOtp } from "../utils/validators";

export function ResetPasswordForm() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ otp?: string; password?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState<{ otp?: boolean; password?: boolean; confirmPassword?: boolean }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tempEmail = sessionStorage.getItem("auth_temp_email");

      if (!tempEmail) {
        setError("Reset session expired or invalid. Please try the forgot password request again.");
      } else {
        setEmail(tempEmail);
      }
    }
  }, []);

  const validate = (field: "otp" | "password" | "confirmPassword", value: string, currentPasswordState?: string) => {
    let err = "";
    if (field === "otp") {
      const otpError = validateOtp(value);
      if (otpError) err = otpError;
    } else if (field === "password") {
      const passwordError = validatePassword(value);
      if (passwordError) err = passwordError;
    } else if (field === "confirmPassword") {
      const pwd = currentPasswordState !== undefined ? currentPasswordState : password;
      if (value !== pwd) {
        err = "Passwords do not match";
      }
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: "otp" | "password" | "confirmPassword") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = "";
    if (field === "otp") val = otp;
    else if (field === "password") val = password;
    else val = confirmPassword;
    validate(field, val);
  };

  const handleChange = (field: "otp" | "password" | "confirmPassword", val: string) => {
    if (field === "otp") {
      setOtp(val);
      if (touched.otp || val.length >= 6) {
        setTouched((prev) => ({ ...prev, otp: true }));
        validate("otp", val);
      }
    } else if (field === "password") {
      setPassword(val);
      if (touched.password) validate("password", val);
      if (touched.confirmPassword) validate("confirmPassword", confirmPassword, val);
    } else if (field === "confirmPassword") {
      setConfirmPassword(val);
      if (touched.confirmPassword) validate("confirmPassword", val);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Reset session expired. Please go back and request a new code.");
      return;
    }

    // Touch and validate all fields
    setTouched({ otp: true, password: true, confirmPassword: true });
    const otpErr = validate("otp", otp);
    const passwordErr = validate("password", password);
    const confirmErr = validate("confirmPassword", confirmPassword);

    if (otpErr || passwordErr || confirmErr) {
      return;
    }

    setIsLoading(true);
    const response = await resetPassword(email, otp, password);
    setIsLoading(false);

    if (response.success) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_temp_email");
      }
      toast.success("Your password has been successfully updated!");
      router.push("/login");
    } else {
      setError(response.error || "Failed to reset password. Please check your verification code and try again.");
    }
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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Reset Password</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter the 6-digit verification code sent to your email and create a new password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
        
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
            onChange={(e) => handleChange("otp", e.target.value.replace(/\D/g, ""))}
            onBlur={() => handleBlur("otp")}
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

        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              touched.password && errors.password ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => handleChange("password", e.target.value)}
              onBlur={() => handleBlur("password")}
              placeholder="••••••••"
              className={`w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900/50 border rounded-lg text-sm text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 transition-all ${
                touched.password && errors.password
                  ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 focus:border-primary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors cursor-pointer"
            >
              {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="text-xs font-semibold text-rose-500 mt-0.5">{errors.password}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirmPassword"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              touched.confirmPassword && errors.confirmPassword ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            onBlur={() => handleBlur("confirmPassword")}
            placeholder="••••••••"
            className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border rounded-lg text-sm text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 transition-all ${
              touched.confirmPassword && errors.confirmPassword
                ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 focus:border-primary"
            }`}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p className="text-xs font-semibold text-rose-500 mt-0.5">{errors.confirmPassword}</p>
          )}
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
