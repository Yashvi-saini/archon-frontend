"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background text-foreground transition-colors duration-200 ">
      
      {/* Left Column - Slogan & Illustration*/}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-100 dark:bg-[#1a1d24] transition-colors duration-200 relative overflow-hidden border-r border-border">
        {/* Content & Illustration */}
        <div className="flex flex-col items-center justify-center flex-1 max-w-md mx-auto text-center gap-8 py-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            {title}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            {subtitle}
          </p>
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 select-none pointer-events-none mt-4">
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
      <div className="flex flex-col justify-between p-8 sm:p-12 md:p-16 lg:p-24 bg-white dark:bg-[#0f1115] transition-colors duration-200 relative">
        {/* Floating Utilities */}
        <div className="absolute top-6 right-6 flex items-center gap-4">
          <ThemeToggle />
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-12">
          {children}
        </div>

        {/* Mobile Brand Footer */}
        <div className="lg:hidden text-center text-xs text-zinc-500 mt-8">
          &copy; {new Date().getFullYear()} All rights reserved.
        </div>
      </div>

    </div>
  );
}
