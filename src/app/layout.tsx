import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://archon-frontend-iota.vercel.app"),
  title: {
    default: "Archon | Think like an architect",
    template: "%s | Archon",
  },
  description: "Scale your systems, master design patterns, and ace your technical interviews on Archon.",
  openGraph: {
    title: "Archon | Think like an architect",
    description: "Scale your systems, master design patterns, and ace your technical interviews on Archon.",
    url: "/",
    siteName: "Archon",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Archon | Think like an architect",
    description: "Scale your systems, master design patterns, and ace your technical interviews on Archon.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-[#0c0d10] transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
