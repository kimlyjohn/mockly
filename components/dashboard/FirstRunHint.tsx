"use client";

import { useState } from "react";
import { Lightbulb, X } from "lucide-react";

const STORAGE_KEY = "mockly-first-run-hint-dismissed";

export function FirstRunHint() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem(STORAGE_KEY) !== "true";
  });

  if (!visible) {
    return null;
  }

  return (
    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="mt-0.5 h-4 w-4 text-emerald-700 dark:text-emerald-300" />
          <p className="text-emerald-900 dark:text-emerald-100">
            Tip: Build an AI prompt, paste it into ChatGPT/Claude/Gemini with
            your sources, then import the returned JSON to create your mock
            exam.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(STORAGE_KEY, "true");
            setVisible(false);
          }}
          className="rounded-md p-1 text-emerald-700 transition hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
          aria-label="Dismiss app tip"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
