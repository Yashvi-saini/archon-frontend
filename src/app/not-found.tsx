"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

      {/* Floating Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}} />

      {/* Main Container */}
      <div className="max-w-xl w-full text-center flex flex-col items-center z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        
        {/* 404 Illustration */}
        <div className="w-full flex justify-center mb-8">
          <img
            src="/404.svg"
            alt="Page Not Found"
            className="max-w-xs md:max-w-md w-full h-auto animate-float filter drop-shadow-xl"
            id="404-illustration"
          />
        </div>
        <p className="text-zinc-500 dark:text-zinc-400 text-base md:text-lg mb-8 max-w-md">
          The page you are looking for doesn&apos;t exist, has been moved, or is temporarily unavailable. Let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            id="back-to-home-btn"
          >
            <Home className="h-4 w-4" />
            Go to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-semibold text-sm rounded-lg shadow-xs transition-all duration-200 cursor-pointer"
            id="go-back-btn"
          >
            <ChevronLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>

      </div>

    </div>
  );
}
