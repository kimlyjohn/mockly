"use client";

import { useEffect } from "react";

const applyTheme = (theme: "system" | "light" | "dark") => {
  if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    document.documentElement.setAttribute(
      "data-theme",
      prefersDark ? "dark" : "light",
    );
    return;
  }
  document.documentElement.setAttribute("data-theme", theme);
};

export function ThemeInitializer() {
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    try {
      const stored = localStorage.getItem("mockly-theme");
      if (stored === "light" || stored === "dark" || stored === "system") {
        applyTheme(stored);
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
