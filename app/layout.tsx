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

import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
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
  const initialTheme = cookieTheme === "dark" ? "dark" : "light";

  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      data-theme={initialTheme}
      style={{
        colorScheme: initialTheme,
      }}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content={initialTheme} />
        <style>{`html{background:#f7fbfa;}html[data-theme="dark"]{background:#050a12;}`}</style>
      </head>
      <body
        className={`${displayFont.variable} ${bodyFont.variable} antialiased`}
      >
        <ThemeInitializer />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
