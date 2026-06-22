export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMOJI_REGEX = /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u;

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email address is required.";
  if (EMOJI_REGEX.test(trimmed)) {
    return "Email cannot contain emojis.";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Please enter a valid email address (e.g., name@example.com).";
  }
  return null;
}

export function validatePassword(password: string): string | null {
  const trimmed = password.trim();
  if (!trimmed) return "Password is required.";
  if (EMOJI_REGEX.test(trimmed)) {
    return "Password cannot contain emojis.";
  }
  if (trimmed.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (trimmed.length > 30) {
    return "Password must be 30 characters or fewer.";
  }
  if (!/[A-Z]/.test(trimmed)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[a-z]/.test(trimmed)) {
    return "Password must contain at least one lowercase letter.";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(trimmed)) {
    return "Password must contain at least one special character.";
  }
  return null;
}

export function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return "Name is required.";
  if (EMOJI_REGEX.test(trimmed)) {
    return "Name cannot contain emojis.";
  }
  if (trimmed.length < 2) {
    return "Name must be at least 2 characters long.";
  }
  if (trimmed.length > 100) {
    return "Name must be 100 characters or fewer.";
  }
  return null;
}

export function validateOtp(otp: string): string | null {
  const trimmed = otp.trim();
  if (!trimmed) return "Verification code is required.";
  if (trimmed.length !== 6 || !/^\d+$/.test(trimmed)) {
    return "Please enter a valid 6-digit verification code.";
  }
  return null;
}
