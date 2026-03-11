"use client";

import type { MultipleChoiceQuestion as MultipleChoiceQuestionType } from "@/types/exam";

import { cn } from "@/lib/utils";

interface MultipleChoiceQuestionProps {
  question: MultipleChoiceQuestionType;
  value?: string;
  onChange: (value: string) => void;
}

export function MultipleChoiceQuestion({
  question,
  value,
  onChange,
}: MultipleChoiceQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
        {question.prompt}
      </p>
      <div className="space-y-2">
        {question.options.map((option, index) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition",
              value === option
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40"
                : "border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500",
            )}
          >
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {String.fromCharCode(65 + index)}.
            </span>{" "}
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
