"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load sidebar preference from localStorage on mount (hydration safety)
  useEffect(() => {
    const savedPreference = localStorage.getItem("archon_sidebar_collapsed");
    if (savedPreference === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed(prev => {
      const nextValue = !prev;
      localStorage.setItem("archon_sidebar_collapsed", String(nextValue));
      return nextValue;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-sans flex overflow-hidden h-screen w-screen">
      {/* Shared Sidebar */}
      <Sidebar 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Pane - transition margins smoothly when sidebar collapses */}
      <div className={`flex flex-1 flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ${
        isCollapsed ? "lg:pl-[76px]" : "lg:pl-[275px]"
      }`}>
        {/* Shared Navbar */}
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-[#0c0d10] transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
