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

  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      data-theme={initialTheme}
      style={{
        colorScheme:
          initialTheme === "dark"
            ? "dark"
            : initialTheme === "light"
              ? "light"
              : "light dark",
      }}
      suppressHydrationWarning
    >
      <head>
        <meta
          name="color-scheme"
          content={
            initialTheme === "dark"
              ? "dark"
              : initialTheme === "light"
                ? "light"
                : "light dark"
          }
        />
        <style>{`html{background:#f7fbfa;}@media (prefers-color-scheme: dark){html:not([data-theme]){background:#050a12;}}`}</style>
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
