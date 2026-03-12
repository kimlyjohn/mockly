import type { Metadata } from "next";
import { Manrope, Sora, Geist } from "next/font/google";
import { cookies } from "next/headers";

import { ThemeInitializer } from "@/components/dashboard/ThemeInitializer";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const displayFont = Sora({
  variable: "--font-display",
  weight: ["700"],
  subsets: ["latin"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: "Mockly",
  description:
    "Mockly helps learners turn source material into realistic mock exams, practice under exam-like flow, and review with clarity.",
  openGraph: {
    title: "Mockly",
    description:
      "Create, practice, and review mock exams from your own source material.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("mockly-theme")?.value;
  const initialTheme =
    cookieTheme === "light" || cookieTheme === "dark" ? cookieTheme : undefined;

  const themeBootScript = `(() => {
    try {
      const cookieMatch = document.cookie.match(/(?:^|; )mockly-theme=([^;]+)/);
      const cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      const stored = localStorage.getItem("mockly-theme");
      const preferred = cookieTheme === "light" || cookieTheme === "dark" || cookieTheme === "system"
        ? cookieTheme
        : stored;
      const theme = preferred === "light" || preferred === "dark" || preferred === "system"
        ? preferred
        : "system";
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const resolved = prefersDark ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", resolved);
        document.documentElement.style.colorScheme = resolved;
      } else {
        document.documentElement.setAttribute("data-theme", theme);
        document.documentElement.style.colorScheme = theme;
      }
    } catch {}
  })();`;

  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      data-theme={initialTheme}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} antialiased`}
      >
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
