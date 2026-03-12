"use client";

import type { TrueFalseQuestion as TrueFalseQuestionType } from "@/types/exam";

import { cn } from "@/lib/utils";

interface TrueFalseQuestionProps {
  question: TrueFalseQuestionType;
  value?: string;
  onChange: (value: string) => void;
}

export function TrueFalseQuestion({
  question,
  value,
  onChange,
}: TrueFalseQuestionProps) {
  return (
    <div className="space-y-5">
      <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
        {question.prompt}
      </p>
      <div className="grid gap-4">
        {[
          { key: "true", label: "True" },
          { key: "false", label: "False" },
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => onChange(option.key)}
            className={cn(
              "w-full rounded-xl border px-4 py-5 text-left transition",
              value === option.key
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                : "border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Shortcut: press T for true or F for false.
      </p>
    </div>
  );
}
