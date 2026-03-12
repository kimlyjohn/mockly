"use client";

import { useEffect } from "react";

import { readApiResponse } from "@/lib/api-client";

const getCookieTheme = (): "light" | "dark" | null => {
  try {
    const match = document.cookie.match(/(?:^|; )mockly-theme=([^;]+)/);
    const value = match ? decodeURIComponent(match[1]) : null;
    if (value === "light" || value === "dark") {
      return value;
    }
    if (value === "system") {
      return "light";
    }
    return null;
  } catch {
    return null;
  }
};

const applyTheme = (theme: "light" | "dark") => {
  document.cookie = `mockly-theme=${theme}; path=/; max-age=31536000; samesite=lax`;

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
};

export function ThemeInitializer() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("mockly-theme");
      const cookieTheme = getCookieTheme();
      const initialTheme =
        stored === "light" || stored === "dark"
          ? stored
          : stored === "system"
            ? "light"
            : cookieTheme;

      if (initialTheme) {
        localStorage.setItem("mockly-theme", initialTheme);
        applyTheme(initialTheme);
      } else {
        localStorage.setItem("mockly-theme", "light");
        applyTheme("light");
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

        const payload = await readApiResponse<{
          theme?: "light" | "dark";
        }>(response);

        const theme = payload?.data?.theme ?? "light";
        localStorage.setItem("mockly-theme", theme);
        applyTheme(theme);
      } catch {
        // Ignore initialization failures and fallback to media query.
      }
    };

    void syncTheme();
  }, []);

  return null;
}
