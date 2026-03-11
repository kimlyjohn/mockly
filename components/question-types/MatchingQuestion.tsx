"use client";

import { useMemo, useState } from "react";

import type { MatchingQuestion as MatchingQuestionType } from "@/types/exam";
import { cn } from "@/lib/utils";

interface MatchingQuestionProps {
  question: MatchingQuestionType;
  value?: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}

export function MatchingQuestion({
  question,
  value = {},
  onChange,
}: MatchingQuestionProps) {
  const [activeLeft, setActiveLeft] = useState<string | null>(null);

  const usedRights = useMemo(() => new Set(Object.values(value)), [value]);

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
        {question.prompt}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Click a left item first, then click its matching right item.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Left
          </p>
          {question.options.left.map((left) => (
            <button
              key={left}
              onClick={() => setActiveLeft(left)}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                activeLeft === left
                  ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
                  : "border-slate-300 dark:border-slate-700",
              )}
            >
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {left}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {value[left] ? `Matched: ${value[left]}` : "Not matched"}
              </p>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Right
          </p>
          {question.options.right.map((right) => (
            <button
              key={right}
              onClick={() => {
                if (!activeLeft) {
                  return;
                }

                const next = { ...value };
                Object.entries(next).forEach(([left, selectedRight]) => {
                  if (selectedRight === right) {
                    delete next[left];
                  }
                });
                next[activeLeft] = right;
                onChange(next);
                setActiveLeft(null);
              }}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition",
                usedRights.has(right)
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500",
              )}
            >
              {right}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
