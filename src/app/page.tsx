"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ThemeToggle } from "@/components/layout/theme-toggle";

// Dynamically import LightRays to completely avoid SSR hydration mismatch
const LightRays = dynamic(() => import("@/components/ui/light-rays"), {
  ssr: false,
});

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0d10] text-zinc-900 dark:text-zinc-50 flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-300">
      {/* Volumetric LightRays WebGL Background - Fixed viewport-wide background tinted in project purple (#BA68C8) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <LightRays raysColor="#BA68C8" />
      </div>

      {/* Floating Logo Icon (Softer zinc background instead of pure white) */}
      <div className="fixed top-6 left-6 z-40">
        <Link 
          href="/" 
          className="relative w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex-shrink-0 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm"
          title="Archon Home"
        >
          <Image
            src="/logo.png"
            alt="Archon Logo"
            width={20}
            height={20}
            priority
            className="object-contain"
          />
        </Link>
      </div>

      {/* Floating Action Controls (ThemeToggle + Sized-down Hamburger Button with soft zinc backgrounds) */}
      <div className="fixed top-6 right-6 z-55 flex items-center gap-3">
        <ThemeToggle />
        
        {/* Animated Hamburger Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm hover:scale-105 active:scale-95 transition-all duration-250 cursor-pointer focus:outline-none"
          id="hamburger-menu-btn"
          aria-label="Toggle Menu"
        >
          <span className={`w-3.5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-1" : ""}`} />
          <span className={`w-3.5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""}`} />
          <span className={`w-3.5 h-0.5 bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-1" : ""}`} />
        </button>
      </div>

      {/* Backdrop overlay when side menu is active */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 bg-black/10 dark:bg-black/40 backdrop-blur-xs z-40 animate-in fade-in duration-300"
        />
      )}

      {/* Semicircle Expansion Navigation Menu (Softer zinc background instead of pure white) */}
      <div
        className={`fixed -top-20 -right-20 w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-full bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-855 shadow-xl z-50 transition-all duration-500 ease-out origin-top-right ${
          menuOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        }`}
        id="semicircle-navbar"
      >
        {/* Navigation Links positioned in the visible bottom-left quadrant of the expanding semicircle */}
        <div className="absolute bottom-12 left-12 sm:bottom-16 sm:left-16 flex flex-col gap-4 text-left">
          <span className="text-[8px] tracking-[0.25em] font-mono text-zinc-400 dark:text-zinc-500 uppercase select-none">
            ARCHON SHELL
          </span>
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="text-base font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-[#BA68C8] dark:hover:text-[#BA68C8] transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            href="/interviews"
            onClick={() => setMenuOpen(false)}
            className="text-base font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-[#BA68C8] dark:hover:text-[#BA68C8] transition-colors duration-200"
          >
            Interviews
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="text-base font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-[#BA68C8] dark:hover:text-[#BA68C8] transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            href="/signup"
            onClick={() => setMenuOpen(false)}
            className="text-base font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:text-[#BA68C8] dark:hover:text-[#BA68C8] transition-colors duration-200"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Main Hero Section (H1 split into "Archon" on top line, and "Think like an architect." on the line below) */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto py-24 sm:py-36 animate-in fade-in duration-500">
        <h1 className="flex flex-col gap-4 tracking-tight leading-none">
          <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-zinc-900 dark:text-zinc-50">
            Archon
          </span>
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-500 dark:text-zinc-400">
            Think like an architect.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-450 mt-6 max-w-2xl mx-auto leading-relaxed">
          Master system design, build scalable architectures, and ace your technical interviews on a high-fidelity workspace.
        </p>

        {/* Action Controls (Hero Primary Styled with Project Purple theme color: #BA68C8) */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10 w-full max-w-xs sm:max-w-md justify-center">
          <Link
            href="/dashboard"
            className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-[#BA68C8] hover:bg-[#a85bbf] text-white text-xs font-bold tracking-wider uppercase rounded-lg transition-all duration-300 cursor-pointer shadow-sm"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-zinc-100/60 dark:bg-zinc-900/40 hover:bg-zinc-200/50 dark:hover:bg-zinc-850 border border-zinc-250 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold tracking-wider uppercase rounded-lg transition-all duration-200 cursor-pointer backdrop-blur-xs shadow-sm"
          >
            Enter Platform
          </Link>
        </div>
      </main>

      {/* Platform Capabilities Section - Cards set to softer zinc-100/50 backgrounds */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="text-center md:text-left md:flex md:items-end md:justify-between mb-16">
          <div className="max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Engineered for software architects.
            </h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mt-4 md:mt-0 leading-relaxed">
            Archon provides a high-fidelity workspace designed to simulate real-world system design environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Capability 1 */}
          <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 backdrop-blur-xs flex flex-col justify-between h-64 transition-all duration-300 hover:border-[#BA68C8]/50 dark:hover:border-[#BA68C8]/50 hover:bg-zinc-200/40 dark:hover:bg-zinc-900/80 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Architecture Playground
              </h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed">
                Build interactive whiteboard diagrams using our robust canvas. Design nodes, define communication protocols, and map out complex network topologies.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#BA68C8] dark:text-[#BA68C8] tracking-wider font-mono text-[10px]">
              CANVAS MODULE
            </span>
          </div>

          {/* Capability 2 */}
          <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 backdrop-blur-xs flex flex-col justify-between h-64 transition-all duration-300 hover:border-[#BA68C8]/50 dark:hover:border-[#BA68C8]/50 hover:bg-zinc-200/40 dark:hover:bg-zinc-900/80 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Scenario Catalog
              </h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed">
                Tackle curated real-world scaling challenges. From designing a global CDN to architecting high-throughput message queues.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#BA68C8] dark:text-[#BA68C8] tracking-wider font-mono text-[10px]">
              CHALLENGE ENGINE
            </span>
          </div>

          {/* Capability 3 */}
          <div className="p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 backdrop-blur-xs flex flex-col justify-between h-64 transition-all duration-300 hover:border-[#BA68C8]/50 dark:hover:border-[#BA68C8]/50 hover:bg-zinc-200/40 dark:hover:bg-zinc-900/80 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Automated Verification
              </h3>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-3 leading-relaxed">
                Submit your architecture designs to receive immediate structural evaluations, detecting performance bottlenecks, security flaws, and scale limits.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#BA68C8] dark:text-[#BA68C8] tracking-wider font-mono text-[10px]">
              FEEDBACK ENGINE
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section - Step cards set to soft zinc-100/50 backgrounds */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-20 w-full bg-zinc-100/20 dark:bg-zinc-900/10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            How Archon prepares you.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="flex flex-col gap-4 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs">
            <span className="text-5xl font-bold text-zinc-200 dark:text-zinc-800 tracking-tight leading-none font-mono">
              01
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Select a Design Scenario
            </h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
              Choose from our extensive repository of enterprise-grade system design problems tailored to test scaling, failure recovery, and architectural compromises.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-4 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs">
            <span className="text-5xl font-bold text-zinc-200 dark:text-zinc-800 tracking-tight leading-none font-mono">
              02
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Map Out the Architecture
            </h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
              Use the interactive, collaborative canvas to layout databases, caches, load balancers, and services. Select appropriate storage types and connection protocols.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-4 bg-zinc-100/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 p-6 rounded-xl shadow-xs">
            <span className="text-5xl font-bold text-zinc-200 dark:text-zinc-800 tracking-tight leading-none font-mono">
              03
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Analyze & Refine
            </h3>
            <p className="text-xs text-zinc-555 dark:text-zinc-400 leading-relaxed">
              Submit your design. Our verification engine checks for standard architectural vulnerabilities, data inconsistency risks, and single points of failure.
            </p>
          </div>
        </div>
      </section>

      {/* Confidence Callout Section - Practice primary button styled with Project Purple theme color: #BA68C8 */}
      <section className="relative z-20 max-w-5xl mx-auto px-6 py-20 w-full text-center">
        <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-900/20 backdrop-blur-md p-10 sm:p-16 rounded-2xl flex flex-col items-center gap-6 shadow-sm">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight max-w-2xl leading-tight">
            Not confident about your prep? Want to practice? We got you.
          </h2>
          <p className="text-xs sm:text-sm text-zinc-505 dark:text-zinc-450 max-w-xl leading-relaxed">
            Archon offers a risk-free interactive sandbox environment where you can build, break, and rebuild complex architectures. Assess your skills with instant automated reviews and real-time feedback before you face your actual interview panel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md mt-4 justify-center">
            <Link
              href="/quiz"
              className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-[#BA68C8] hover:bg-[#a85bbf] text-white text-xs font-bold tracking-wider uppercase rounded-lg transition-all duration-300 cursor-pointer shadow-xs"
            >
              Take Diagnostic Quiz
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-250 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold tracking-wider uppercase rounded-lg transition-all duration-200 cursor-pointer shadow-xs"
            >
              Open Sandbox
            </Link>
          </div>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              Tailored pathways for every level.
            </h2>
            <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-4 leading-relaxed">
              Whether you are prepping for senior engineering interviews or designing infrastructure for high-scale products, Archon provides the structure you need.
            </p>

            <div className="mt-8 space-y-6">
              <div className="border-l-2 border-[#BA68C8] pl-4">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">System Design Track</h4>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 leading-relaxed">
                  High-level scaling, microservices coordination, consistent hashing, replication strategies, and fault tolerance.
                </p>
              </div>
              <div className="border-l-2 border-zinc-200 dark:border-zinc-850 pl-4">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Design Patterns Track</h4>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 leading-relaxed">
                  SOLID principles, structural and behavioral patterns, concurrency primitives, and clean code abstractions.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive dashboard visual box - Background set to soft zinc-100/50 (No pure white) */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/40 backdrop-blur-xs p-8 rounded-2xl flex flex-col gap-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Rate Limiter System</span>
                <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50">COMPLETED</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Global Notification Engine</span>
                <span className="text-[10px] font-mono text-primary font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50">ACTIVE</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-zinc-200/50 dark:border-zinc-800/50">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Distributed Web Crawler</span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50">LOCKED</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Realtime Analytics Pipeline</span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-medium px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-700/50">LOCKED</span>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center justify-center h-9 w-full bg-[#BA68C8] hover:bg-[#a85bbf] text-white text-xs font-bold tracking-wider uppercase rounded-lg transition-all duration-300 cursor-pointer shadow-xs"
            >
              Launch Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="relative z-20 max-w-5xl mx-auto px-6 py-24 text-center w-full flex flex-col items-center gap-6">
        <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight max-w-lg">
          Ready to design at enterprise scale?
        </h2>
        <p className="text-sm text-zinc-550 dark:text-zinc-450 max-w-md leading-relaxed">
          Join senior engineers, team leads, and architects mastering system design and patterns on Archon.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-md mt-4 justify-center">
          <Link
            href="/signup"
            className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-[#BA68C8] hover:bg-[#a85bbf] text-white text-xs font-bold tracking-wider uppercase rounded-lg transition-all duration-300 cursor-pointer shadow-sm"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center h-10 px-5 bg-zinc-100/60 dark:bg-zinc-900/40 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold tracking-wider uppercase rounded-lg transition-all duration-200 cursor-pointer backdrop-blur-xs shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer Details - Footer top border removed for seamless flow */}
      <footer className="relative z-20 w-full transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] tracking-wider text-zinc-400 dark:text-zinc-500">
          <span>© 2026 ARCHON SYSTEMS.</span>
          <span>ALL SYSTEMS OPERATIONAL</span>
        </div>
      </footer>
    </div>
  );
}
