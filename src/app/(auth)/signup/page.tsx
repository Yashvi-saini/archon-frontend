import { AuthLayout, SignupForm } from "@/features/auth";

export const metadata = {
  title: "Register | Archon",
  description: "Create an Archon account to practice system design interviews.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Start designing systems at scale and master technical architectural interviews!"
      subtitle="Create your free developer account to gain instant access to system design templates and collaborative real-time workspace rooms."
      illustrationSrc="/illustrations/Sign up-amico.svg"
      illustrationAlt="Signup Illustration"
    >
      <SignupForm />
    </AuthLayout>
  );
}
