export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function request<T = any>(path: string, body?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include", 
    });

    const result = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: result.error || result.message || `Request failed with status ${response.status}`,
      };
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

// 3. Login User (Cookies automatically set by Set-Cookie header)
export async function loginUser(email: string, password: string) {
  return request("/login", { email, password });
}

// 4. Refresh Token (Cookies automatically sent in headers)
export async function refreshAccessToken() {
  return request("/refresh");
}

// 5. Logout User (Cookies automatically sent in headers)
export async function logoutUser() {
  return request("/logout");
}

// 6. Forgot Password
export async function forgotPassword(email: string) {
  return request("/forgot-password", { email });
}

// 7. Reset Password
export async function resetPassword(email: string, otp: string, newPassword: string) {
  return request("/reset-password", { email, otp, new_password: newPassword });
}
