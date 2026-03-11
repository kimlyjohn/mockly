"use client";

import type {
  IdentificationNoChoicesQuestion,
  IdentificationWithChoicesQuestion,
} from "@/types/exam";

interface IdentificationQuestionProps {
  question: IdentificationNoChoicesQuestion | IdentificationWithChoicesQuestion;
  value?: string;
  onChange: (value: string) => void;
}

export function IdentificationQuestion({
  question,
  value = "",
  onChange,
}: IdentificationQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
        {question.prompt}
      </p>

      {question.hasChoices ? (
        <select
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select an answer</option>
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Type your answer"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
        />
      )}
    </div>
  );
}
