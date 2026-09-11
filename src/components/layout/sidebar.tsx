"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, LayoutDashboard, Network, Terminal, Activity, Layers, Settings, X, Menu,ChevronRight,ChevronLeft,Sliders} from "lucide-react";
import { logoutUser } from "@/features/auth/api/auth";
import { useAuth } from "@/providers/auth-provider";
import { useUserSettings } from "@/features/settings";
import { toast } from "sonner";

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { userEmail, logout } = useAuth();
  const { data: userSettings } = useUserSettings();

  const email = userEmail || userSettings?.email || "architect@archon.io";
  const name = userSettings?.fullName || (email.includes("@") ? email.split("@")[0] : email) || "Architect";
  const initials = (name.slice(0, 2) || "AR").toUpperCase();

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/interviews", label: "Interviews", icon: Network },
    { href: "/reports", label: "Reports", icon: Activity },
    { href: "/analytics", label: "Analytics", icon: Layers },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/quiz", label: "Quiz", icon: Sliders },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-45 bg-zinc-950/45 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Shell */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 bg-white dark:bg-[#090a0f] text-zinc-600 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 ${
        isOpen 
          ? "translate-x-0 w-[275px]" 
          : "-translate-x-full lg:translate-x-0 " + (isCollapsed ? "lg:w-[76px]" : "lg:w-[275px]")
      }`}>
        
        {/* Header/Brand */}
        <div className={`px-4 h-16 flex items-center border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? "justify-center" : "justify-between px-6"
        }`}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Archon Logo"
                width={22}
                height={22}
                priority
                className="object-contain"
              />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50 transition-opacity duration-200">
                Archon
              </span>
            )}
          </Link>
          
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 px-3.5 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isCollapsed ? "justify-center p-3" : "gap-3.5 px-3.5 py-2.5"
                } ${
                  isActive 
                    ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 border border-zinc-200/60 dark:border-zinc-800 shadow-xs font-bold" 
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-300"
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-primary" : "text-zinc-400 dark:text-zinc-500"}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Controls & User Footer */}
        <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 flex-shrink-0 space-y-3">
          
          {/* Collapse Toggle Row (Desktop Only) */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className={`hidden lg:flex items-center text-xs font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-all cursor-pointer w-full ${
              isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2"
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4.5 w-4.5 text-zinc-400 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4.5 w-4.5 text-zinc-400 flex-shrink-0" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>

          {/* Profile Card */}
          <div className={`flex items-center rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 ${
            isCollapsed ? "justify-center p-2" : "gap-3 p-2.5"
          }`}>
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs border border-primary/20 flex-shrink-0">
              {initials}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-50 capitalize">{name}</p>
                  <p className="truncate text-[11px] text-zinc-400 dark:text-zinc-500" title={email}>{email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-zinc-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 transition-colors cursor-pointer flex-shrink-0"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
