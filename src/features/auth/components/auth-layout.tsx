"use client";

import React from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  illustrationSrc: string;
  illustrationAlt: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  illustrationSrc,
  illustrationAlt,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen lg:overflow-hidden grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground transition-colors duration-200">
      
      {/* Left Column - Slogan & Illustration (Centered, compact) */}
      <div className="hidden lg:flex flex-col justify-center p-8 xl:p-12 bg-zinc-100 dark:bg-[#1a1d24] transition-colors duration-200 relative overflow-hidden border-r border-border">
        {/* Decorative background ambient glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        
        {/* Content & Illustration */}
        <div className="flex flex-col items-center justify-center max-w-md mx-auto text-center gap-6 py-4 z-10">
          <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            {title}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-xs">
            {subtitle}
          </p>
          <div className="relative w-64 h-64 xl:w-72 xl:h-72 select-none pointer-events-none mt-2">
            <Image
              src={illustrationSrc}
              alt={illustrationAlt}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right Column - Auth Form Panel */}
      <div className="flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:py-6 lg:px-12 xl:py-8 xl:px-16 bg-white dark:bg-[#0f1115] transition-colors duration-200 relative overflow-hidden">
        {/* Floating Utilities */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-4 xl:py-6 z-10">
          {children}
        </div>

      </div>

    </div>
  );
}
