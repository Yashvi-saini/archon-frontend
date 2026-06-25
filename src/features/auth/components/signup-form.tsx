"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { registerUser } from "../api/auth";
import { validateName, validateEmail, validatePassword } from "../utils/validators";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean; confirmPassword?: boolean }>({});

  const handleGoogleLogin = () => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://archon.monu14.me";
    window.location.href = `${apiBaseUrl}/login/google`;
  };

  const validate = (field: "name" | "email" | "password" | "confirmPassword", value: string, currentPasswordState?: string) => {
    let err = "";
    if (field === "name") {
      const nameError = validateName(value);
      if (nameError) err = nameError;
    } else if (field === "email") {
      const emailError = validateEmail(value);
      if (emailError) err = emailError;
    } else if (field === "password") {
      const passwordError = validatePassword(value);
      if (passwordError) err = passwordError;
    } else if (field === "confirmPassword") {
      const pwd = currentPasswordState !== undefined ? currentPasswordState : password;
      if (value !== pwd) {
        err = "Passwords do not match.";
      }
    }
    setErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  };

  const handleBlur = (field: "name" | "email" | "password" | "confirmPassword") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    let val = "";
    if (field === "name") val = name;
    else if (field === "email") val = email;
    else if (field === "password") val = password;
    else if (field === "confirmPassword") val = confirmPassword;
    validate(field, val);
  };

  const handleChange = (field: "name" | "email" | "password" | "confirmPassword", val: string) => {
    if (field === "name") {
      setName(val);
      const nameError = validateName(val);
      setErrors((prev) => ({ ...prev, name: nameError || undefined }));
    } else if (field === "email") {
      setEmail(val);
      if (touched.email) validate("email", val);
    } else if (field === "password") {
      setPassword(val);
      if (touched.password) validate("password", val);
      if (touched.confirmPassword) validate("confirmPassword", confirmPassword, val);
    } else if (field === "confirmPassword") {
      setConfirmPassword(val);
      if (touched.confirmPassword) validate("confirmPassword", val);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Set all fields to touched
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    // Validate all fields
    const nameErr = validate("name", name);
    const emailErr = validate("email", email);
    const passwordErr = validate("password", password);
    const matchErr = validate("confirmPassword", confirmPassword);

    if (nameErr || emailErr || passwordErr || matchErr) {
      return;
    }

    setIsLoading(true);
    const response = await registerUser(name, email, password);
    setIsLoading(false);

    if (response.success) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("auth_temp_email", email);
      }
      router.push("/verify-otp?action=verify");
    } else {
      setError(response.error || "Registration failed. Please try again.");
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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Register</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Create an account to begin system design interview practice.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-5">
        
        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              (touched.name || name) && errors.name ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Full Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            placeholder="Enter name"
            className={`w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border rounded-lg text-sm text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 transition-all ${
              ((touched.name || name) && errors.name)
                ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                : "border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 focus:border-primary"
            }`}
          />
          {((touched.name || name) && errors.name) && (
            <p className="text-xs font-semibold text-rose-500 mt-0.5">{errors.name}</p>
          )}
        </div>

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

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="confirm-password"
            className={`text-xs font-semibold uppercase tracking-wider transition-colors ${
              touched.confirmPassword && errors.confirmPassword ? "text-rose-500" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              onBlur={() => handleBlur("confirmPassword")}
              placeholder="••••••••"
              className={`w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900/50 border rounded-lg text-sm text-foreground placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-hidden focus:ring-2 transition-all ${
                touched.confirmPassword && errors.confirmPassword
                  ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-zinc-200 dark:border-zinc-800 focus:ring-primary/20 focus:border-primary"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>
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
          className="w-full mt-4 py-3 px-4 bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            "Register"
          )}
        </button>

      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className=" px-2 text-zinc-500 dark:text-zinc-400 font-medium">Or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-3 px-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 font-semibold text-sm rounded-lg shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
      >
        <img src="/google.svg" alt="Google" className="h-4 w-4" />
        Continue with Google
      </button>

      {/* Footer Link */}
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-8">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline cursor-pointer"
        >
          Login
        </Link>
      </p>

    </div>
  );
}
