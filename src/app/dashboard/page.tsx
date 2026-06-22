"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, LayoutDashboard } from "lucide-react";
import { logoutUser } from "@/features/auth/api/auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    logout();
    toast.success("Logged out successfully");
  };

  // Show loading while auth state initializes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Auth guard handled by AuthProvider — this is a fallback
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Archon Logo"
              width={36}
              height={36}
              className="object-contain rounded-lg"
            />
            <span className="text-lg font-bold tracking-tight">Archon</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-rose-300 dark:hover:border-rose-800 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col gap-8">
          {/* Welcome Section */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Welcome back! You&apos;re logged in successfully.
              </p>
            </div>
          </div>

          {/* Status Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Auth Status
              </p>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Authenticated
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Session
              </p>
              <p className="text-sm font-semibold">Active</p>
            </div>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Flow Test
              </p>
              <p className="text-sm font-semibold text-primary">✓ Complete</p>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 p-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              This is a minimal dashboard page created to verify the authentication flow. 
              If you can see this page, login was successful and your session is persisted.
              Try refreshing the page — you should stay logged in.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
