"use client";

import { useEffect } from "react";

const getCookieTheme = (): "system" | "light" | "dark" | null => {
  try {
    const match = document.cookie.match(/(?:^|; )mockly-theme=([^;]+)/);
    const value = match ? decodeURIComponent(match[1]) : null;
    return value === "light" || value === "dark" || value === "system"
      ? value
      : null;
  } catch {
    return null;
  }
};

const applyTheme = (theme: "system" | "light" | "dark") => {
  document.cookie = `mockly-theme=${theme}; path=/; max-age=31536000; samesite=lax`;

  if (theme === "system") {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "light dark";
    return;
  }

  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
};

export function ThemeInitializer() {
  useEffect(() => {
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
          document.documentElement.style.colorScheme = "light dark";
        }
      } catch {
        // Ignore initialization failures and fallback to media query.
      }
    };

    void syncTheme();
  }, []);

  return null;
}
