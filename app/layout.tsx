import type { Metadata } from "next";
import { Manrope, Merriweather, Geist } from "next/font/google";

import { ThemeInitializer } from "@/components/dashboard/ThemeInitializer";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const displayFont = Merriweather({
  variable: "--font-display",
  weight: ["700"],
  subsets: ["latin"],
});

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mockly",
  description: "Smart mock exam player for fast exam prep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeBootScript = `(() => {
    try {
      const stored = localStorage.getItem("mockly-theme");
      const theme = stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
      } else {
        document.documentElement.setAttribute("data-theme", theme);
      }
    } catch {}
  })();`;

  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
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
