"use client";

import { useEffect } from "react";

const getCookieTheme = (): "system" | "light" | "dark" | null => {
  const match = document.cookie.match(/(?:^|; )mockly-theme=([^;]+)/);
  const value = match ? decodeURIComponent(match[1]) : null;
  return value === "light" || value === "dark" || value === "system"
    ? value
    : null;
};

const applyTheme = (theme: "system" | "light" | "dark") => {
  document.cookie = `mockly-theme=${theme}; path=/; max-age=31536000; samesite=lax`;

  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const resolvedTheme = prefersDark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.style.colorScheme = resolvedTheme;
    return;
  }
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
};

export function ThemeInitializer() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    try {
      const stored = localStorage.getItem("mockly-theme");
      const cookieTheme = getCookieTheme();
      const initialTheme =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : cookieTheme;

      if (initialTheme) {
        localStorage.setItem("mockly-theme", initialTheme);
        applyTheme(initialTheme);
      }
    } catch {
      // Ignore local storage access issues.
    }

    const syncTheme = async () => {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          data?: {
            theme?: "system" | "light" | "dark";
          };
        };

        const theme = payload.data?.theme ?? "system";
        localStorage.setItem("mockly-theme", theme);
        applyTheme(theme);

        if (theme === "system") {
          const media = window.matchMedia("(prefers-color-scheme: dark)");
          const onChange = () => applyTheme("system");
          media.addEventListener("change", onChange);
          cleanup = () => media.removeEventListener("change", onChange);
        }
      } catch {
        // Ignore initialization failures and fallback to media query.
      }
    };

    void syncTheme();

    return () => {
      cleanup?.();
    };
  }, []);

  return null;
}
