import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground transition-colors duration-200 font-sans p-6">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-center">
        Archon - Think like an architect
      </h1>
    </div>
  );
}
