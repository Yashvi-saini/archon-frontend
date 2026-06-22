"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

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


const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);


  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const stored = getStoredToken(TOKEN_KEYS.access);
    if (stored) {
      setAccessToken(stored);
    }
    setIsLoading(false);
  }, []);


  useEffect(() => {
    if (isLoading) return;

    if (!accessToken && !isPublicRoute(pathname)) {
      router.replace("/login");
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
