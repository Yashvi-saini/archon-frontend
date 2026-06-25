export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  access_token?: string;
  refresh_token?: string;
  reset_token?: string;
}

export function sanitizeBackendError(error: string): string {
  if (!error) return "An unexpected error occurred.";

  if (error.includes("validation for 'Email' failed")) {
    return "Please enter a valid email address).";
  }
  if (error.includes("validation for 'Password' failed") && error.includes("'min' tag")) {
    return "Password must be at least 8 characters long.";
  }
  if (error.includes("validation for 'Name' failed")) {
    if (error.includes("'required' tag")) {
      return "Name is required.";
    }
    return "Please enter a valid name.";
  }
  if (
    error.includes("validation for 'NewPassword' failed") || 
    error.includes("validation for 'New_Password' failed")
  ) {
    return "New password must be at least 8 characters long.";
  }
  if (error.includes("validation for 'Otp' failed") || error.includes("validation for 'OTP' failed")) {
    return "Verification code must be exactly 6 digits.";
  }

  // cleanups 
  if (error.toLowerCase().includes("invalid credentials") || error.includes("401")) {
    return "Incorrect email or password. Please try again.";
  }

  return error;
}

// Get stored access token for authenticated requests
function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("archon_access_token");
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("archon_refresh_token");
}

async function request<T = any>(path: string, body?: Record<string, any>, requireAuth = false): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Inject Bearer token for authenticated endpoints
    if (requireAuth) {
      const token = getAccessToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include", 
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: sanitizeBackendError(result.error || result.message || `Request failed with status ${response.status}`),
      };
    }

    if (result.success === undefined) {
      return { success: true, ...result } as ApiResponse<T>;
    }

    return result as ApiResponse<T>;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network error. Please check your internet connection.",
    };
  }
}

// 1. Register User
export async function registerUser(name: string, email: string, password: string) {
  return request("/register", { name, email, password });
}

// 2. Verify Email
export async function verifyEmail(email: string, otp: string) {
  return request("/verify-email", { email, otp });
}

// 3. Login User 
export async function loginUser(email: string, password: string) {
  return request("/login", { email, password });
}

// 4. Refresh Token
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  const body: Record<string, any> = {};
  if (refreshToken) {
    body.refresh_token = refreshToken;
  }
  return request("/refresh", body);
}

// 5. Logout User
export async function logoutUser() {
  const refreshToken = getRefreshToken();
  return request("/logout", { refresh_token: refreshToken }, true);
}

// 6. Forgot Password
export async function forgotPassword(email: string) {
  return request("/forgot-password", { email });
}

// 7. Verify Reset OTP
export async function verifyResetOtp(email: string, otp: string) {
  return request("/verify-reset-otp", { email, otp });
}

// 8. Reset Password
export async function resetPassword(resetToken: string, newPassword: string) {
  return request("/reset-password", { reset_token: resetToken, new_password: newPassword });
}

// 9. Resend OTP
export async function resendOtp(email: string, intent: "register" | "forgot_password") {
  return request("/resend-otp", { email, intent });
}

