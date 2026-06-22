import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-200 font-sans p-6 gap-6">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        <Image
          src="/logo.png"
          alt="Archon Logo"
          width={112}
          height={112}
          priority
          className="object-contain rounded-xl"
        />
      </div>
      
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
        Archon - Think like an architect
      </h1>

      <div className="flex gap-4 items-center">
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 px-5 text-sm font-semibold text-zinc-50 dark:text-zinc-900 shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          Login
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 px-5 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
