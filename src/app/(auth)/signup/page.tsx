import { AuthLayout, SignupForm } from "@/features/auth";

export const metadata = {
  title: "Register | Archon",
  description: "Create an Archon account to practice system design interviews.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Get Started Today"
      subtitle="Join Archon to build, practice, and master technical system design interviews."
      illustrationSrc="/illustrations/Sign up-amico.svg"
      illustrationAlt="Signup Illustration"
    >
      <SignupForm />
    </AuthLayout>
  );
}
