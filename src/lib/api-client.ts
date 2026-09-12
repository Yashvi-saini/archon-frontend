const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8071";

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("archon_access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("archon_refresh_token");
}

function saveTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("archon_access_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("archon_refresh_token", refreshToken);
  }
}

function clearTokensAndRedirect() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("archon_access_token");
  localStorage.removeItem("archon_refresh_token");
  window.dispatchEvent(new Event("archon:unauthorized"));
  if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
    window.location.href = "/login";
  }
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

let activeRefreshPromise: Promise<string | null> | null = null;

async function refreshTokens(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokensAndRedirect();
    return null;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      credentials: "include",
    });

    if (!res.ok) {
      clearTokensAndRedirect();
      return null;
    }

    const data = await res.json().catch(() => null);
    const newAccessToken =
      data?.access_token ||
      data?.data?.access_token ||
      data?.accessToken ||
      data?.data?.accessToken;
    const newRefreshToken =
      data?.refresh_token ||
      data?.data?.refresh_token ||
      data?.refreshToken ||
      data?.data?.refreshToken;

    if (newAccessToken) {
      saveTokens(newAccessToken, newRefreshToken);
      return newAccessToken;
    }

    clearTokensAndRedirect();
    return null;
  } catch {
    clearTokensAndRedirect();
    return null;
  } finally {
    activeRefreshPromise = null;
  }
}

interface CustomRequestInit extends RequestInit {
  _isRetry?: boolean;
}

async function request<T>(endpoint: string, options: CustomRequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !options._isRetry) {
    if (!activeRefreshPromise) {
      activeRefreshPromise = refreshTokens();
    }
    const newAccessToken = await activeRefreshPromise;

    if (newAccessToken) {
      return request<T>(endpoint, {
        ...options,
        _isRetry: true,
        headers: {
          ...headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      });
    }

    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (res.status === 401 && options._isRetry) {
    clearTokensAndRedirect();
    throw new ApiError("Session expired. Please log in again.", 401);
  }

  if (res.status === 202) {
    return { status: "evaluating" } as T;
  }

  let body: unknown = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    body = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const errBody = body as { error?: string; message?: string } | null;
    const errorMsg =
      errBody?.error ||
      errBody?.message ||
      `Request failed with status ${res.status}`;
    throw new ApiError(errorMsg, res.status, body);
  }

  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }

  return body as T;
}

export const apiClient = {
  get<T>(endpoint: string, options?: CustomRequestInit): Promise<T> {
    return request<T>(endpoint, { ...options, method: "GET" });
  },
  post<T>(endpoint: string, data?: unknown, options?: CustomRequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },
  put<T>(endpoint: string, data?: unknown, options?: CustomRequestInit): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    });
  },
  delete<T>(endpoint: string, options?: CustomRequestInit): Promise<T> {
    return request<T>(endpoint, { ...options, method: "DELETE" });
  },
};
