"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { loginUser } from "../api/auth";
import { toast } from "sonner";
import { validateEmail, validatePassword } from "../utils/validators";
import { useAuth } from "@/providers/auth-provider";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const hasShownVerifiedToast = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  useEffect(() => {
    if (searchParams.get("verified") === "true" && !hasShownVerifiedToast.current) {
      hasShownVerifiedToast.current = true;
      toast.success("Account verified successfully! You can now log in.");
      router.replace("/login");
    }
  }, [searchParams, router]);

  const validate = (field: "email" | "password", value: string) => {
    let err = "";
    if (field === "email") {
      const emailError = validateEmail(value);
      if (emailError) err = emailError;
    } else if (field === "password") {
      const passwordError = validatePassword(value);
      if (passwordError) err = passwordError;
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === "email" ? email : password;
    validate(field, val);
  };

  const handleChange = (field: "email" | "password", val: string) => {
    if (field === "email") {
      setEmail(val);
    } else {
      setPassword(val);
    }
    if (touched[field]) {
      validate(field, val);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Set all fields to touched
    setTouched({ email: true, password: true });

    // Validate both fields
    const emailErr = validate("email", email);
    const passwordErr = validate("password", password);

    if (emailErr || passwordErr) {
      return;
    }

    setIsLoading(true);
    const response = await loginUser(email, password);
    setIsLoading(false);

    if (response.success) {
      // Extract tokens from response — backend may return them at top level or inside data
      const accessToken = response.access_token || response.data?.access_token;
      const refreshToken = response.refresh_token || response.data?.refresh_token;

      if (accessToken && refreshToken) {
        login(accessToken, refreshToken);
      }

      toast.success("Login successful!");
      router.push("/dashboard");
    } else {
      setError(response.error || "Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="w-full flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:opacity-85 transition-opacity mb-6 group w-fit cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" />
        Back
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Login</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter your credentials to access your interview workspace.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              touched.email && errors.email ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
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

        {/* Password */}
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

        {/* Options */}
        <div className="flex items-center justify-between mt-1 text-sm">
          <label className="flex items-center gap-2 font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-sm border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-primary focus:ring-primary/20 cursor-pointer"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="font-medium text-primary hover:underline cursor-pointer"
          >
            Forgot Password?
          </Link>
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
            "Login"
          )}
        </button>

      </form>

      {/* Footer Link */}
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary hover:underline cursor-pointer"
        >
          Register
        </Link>
      </p>

    </div>
  );
}
