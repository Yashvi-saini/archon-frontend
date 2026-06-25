import { AuthLayout, LoginForm } from "@/features/auth";
import { Suspense } from "react";

export const metadata = {
  title: "Login | Archon",
  description: "Sign in to your Archon interview workspace.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Log in to access your secure developer workspace and collaborative design panels."
      illustrationSrc="/illustrations/Login-amico.svg"
      illustrationAlt="Login Illustration"
    >
      <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
