"use client";

import type { EnumerationQuestion as EnumerationQuestionType } from "@/types/exam";

interface EnumerationQuestionProps {
  question: EnumerationQuestionType;
  value?: string[];
  onChange: (value: string[]) => void;
}

export function EnumerationQuestion({
  question,
  value = [],
  onChange,
}: EnumerationQuestionProps) {
  const answers = Array.from(
    { length: question.correctAnswer.length },
    (_, idx) => value[idx] ?? "",
  );

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
        {question.prompt}
      </p>
      <div className="space-y-2">
        {answers.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-7 text-sm text-slate-500 dark:text-slate-400">
              {index + 1}.
            </span>
            <input
              type="text"
              value={item}
              onChange={(event) => {
                const next = [...answers];
                next[index] = event.target.value;
                onChange(next);
              }}
              placeholder={`Item ${index + 1}`}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {question.orderedAnswer
          ? "Order matters for this question."
          : "Order does not matter for this question."}
      </p>
    </div>
  );
}
