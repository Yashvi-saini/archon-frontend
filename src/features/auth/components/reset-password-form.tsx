"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { resetPassword } from "../api/auth";
import { toast } from "sonner";
import { validatePassword } from "../utils/validators";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState<{ password?: boolean; confirmPassword?: boolean }>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("auth_reset_token");

      if (!token) {
        setError("Reset token missing or expired.");
      } else {
        setResetToken(token);
      }
    }
  }, []);

  const validate = (field: "password" | "confirmPassword", value: string, currentPasswordState?: string) => {
    let err = "";
    if (field === "password") {
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

  const handleBlur = (field: "password" | "confirmPassword") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === "password" ? password : confirmPassword;
    validate(field, val);
  };

  const handleChange = (field: "password" | "confirmPassword", val: string) => {
    if (field === "password") {
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

    if (!resetToken) {
      setError("Reset token missing or expired.");
      return;
    }

    // Touch and validate all fields
    setTouched({ password: true, confirmPassword: true });
    const passwordErr = validate("password", password);
    const confirmErr = validate("confirmPassword", confirmPassword);

    if (passwordErr || confirmErr) {
      return;
    }

    setIsLoading(true);
    const response = await resetPassword(resetToken, password);
    setIsLoading(false);

    if (response.success) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("auth_temp_email");
        sessionStorage.removeItem("auth_reset_token");
      }
      toast.success("Your password has been successfully updated!");
      router.push("/login");
    } else {
      setError(response.error || "Failed to reset password.");
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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Set New Password</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Create a new password that is secure and meets the requirements.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
        
        {/* New Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              touched.password && errors.password ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            New Password
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
          disabled={isLoading || !!error}
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
