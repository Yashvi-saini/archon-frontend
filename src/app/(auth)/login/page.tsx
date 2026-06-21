import { AuthLayout, LoginForm } from "@/features/auth";

export const metadata = {
  title: "Login | Archon",
  description: "Sign in to your Archon interview workspace.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Continue your journey of coding excellence and unlock new challenges with every round!"
      subtitle="Join collaborative whiteboard interviews, code side-by-side with peers, and get immediate AI-driven engineering evaluations."
      illustrationSrc="/illustrations/Login-amico.svg"
      illustrationAlt="Login Illustration"
    >
      <LoginForm />
    </AuthLayout>
  );
}
