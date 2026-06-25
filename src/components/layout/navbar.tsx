"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Menu, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export interface NavbarProps {
  onMenuClick: () => void;
  actionButton?: React.ReactNode;
}

export function Navbar({ onMenuClick, actionButton }: NavbarProps) {
  const pathname = usePathname();

  // Parse path to friendly names for breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return ["Workspace"];
    return segments.map(segment => {
      // Capitalize first letter and replace hyphens with spaces
      return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 z-30 w-full">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors cursor-pointer"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
          <span>Workspace</span>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              <ChevronRight className="h-3 w-3" />
              <span className={`font-bold tracking-wider ${
                index === breadcrumbs.length - 1 
                  ? "text-zinc-900 dark:text-zinc-50 uppercase" 
                  : "text-zinc-500 dark:text-zinc-400"
              }`}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {actionButton}
      </div>
    </header>
  );
}
