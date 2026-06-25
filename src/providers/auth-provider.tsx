"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

import { refreshAccessToken } from "@/features/auth";

//all tokens
const TOKEN_KEYS = {
  access: "archon_access_token",
  refresh: "archon_refresh_token",
} as const;

function getStoredToken(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function storeTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEYS.access, accessToken);
  localStorage.setItem(TOKEN_KEYS.refresh, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.access);
  localStorage.removeItem(TOKEN_KEYS.refresh);
}

//context
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,
  login: () => {},
  logout: () => {},
});

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/verify-otp", "/verify-reset-otp"];
const AUTH_REDIRECT_ROUTES = ["/", "/login", "/signup"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return pathname === "/";
    return pathname === route || pathname.startsWith(route + "/");
  });
}

const PROTECTED_ROUTES = ["/dashboard", "/interviews", "/reports", "/analytics", "/settings"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => {
    return pathname === route || pathname.startsWith(route + "/");
  });
}

function isKnownRoute(pathname: string): boolean {
  return isPublicRoute(pathname) || isProtectedRoute(pathname);
}

function isAuthRedirectRoute(pathname: string): boolean {
  return AUTH_REDIRECT_ROUTES.includes(pathname);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // If we are on a 404 page no refresh api call and no auth checks
      if (!isKnownRoute(window.location.pathname)) {
        setIsLoading(false);
        return;
      }

      try {
        if (typeof window !== "undefined") {
          const searchParams = new URLSearchParams(window.location.search);
          const urlAccessToken = searchParams.get("access_token") || searchParams.get("token");
          const urlRefreshToken = searchParams.get("refresh_token");

          if (urlAccessToken && urlRefreshToken) {
            // Save query tokens
            storeTokens(urlAccessToken, urlRefreshToken);
            setAccessToken(urlAccessToken);
            
            // Clean URL query parameters
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            setIsLoading(false);
            return;
          }
        }

        // Fallback to localStorage
        const stored = getStoredToken(TOKEN_KEYS.access);
        if (stored) {
          setAccessToken(stored);
          setIsLoading(false);
          return;
        }

        // If no stored token, try refresh (cookie-based session recovery)
        const response = await refreshAccessToken();
        if (response.success) {
          const newAccessToken = response.access_token || response.data?.access_token;
          const newRefreshToken = response.refresh_token || response.data?.refresh_token;
          if (newAccessToken && newRefreshToken) {
            storeTokens(newAccessToken, newRefreshToken);
            setAccessToken(newAccessToken);
          }
        } else {
          clearTokens();
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    if (!isKnownRoute(pathname)) return;

    if (!accessToken && !isPublicRoute(pathname)) {
      router.replace("/login");
      return;
    }

    if (accessToken && isAuthRedirectRoute(pathname)) {
      router.replace("/dashboard");
      return;
    }
  }, [isLoading, accessToken, pathname, router]);

  const login = useCallback((newAccessToken: string, newRefreshToken: string) => {
    storeTokens(newAccessToken, newRefreshToken);
    setAccessToken(newAccessToken);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setAccessToken(null);
    router.replace("/login");
  }, [router]);

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
