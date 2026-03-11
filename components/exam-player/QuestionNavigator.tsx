"use client";

import { Flag } from "lucide-react";

import type { Question } from "@/types/exam";
import { cn } from "@/lib/utils";

type QuestionMapItem = {
  id: string;
  type: Question["type"];
};

interface QuestionNavigatorProps {
  currentIndex: number;
  answeredIds: Set<string>;
  flaggedIds: Set<string>;
  questions: QuestionMapItem[];
  visible: boolean;
  onJump: (index: number) => void;
  className?: string;
}

const TYPE_LABELS: Record<Question["type"], string> = {
  true_false: "True/False",
  multiple_choice: "Multiple Choice",
  identification: "Identification",
  matching: "Matching",
  enumeration: "Enumeration",
};

export function QuestionNavigator({
  currentIndex,
  answeredIds,
  flaggedIds,
  questions,
  visible,
  onJump,
  className,
}: QuestionNavigatorProps) {
  if (!visible) {
    return null;
  }

  const answeredCount = questions.filter((q) => answeredIds.has(q.id)).length;
  const total = questions.length;

  const groupedMap = new Map<
    Question["type"],
    Array<{ id: string; index: number }>
  >();

  questions.forEach((question, index) => {
    const items = groupedMap.get(question.type) ?? [];
    items.push({ id: question.id, index });
    groupedMap.set(question.type, items);
  });

  const grouped = Array.from(groupedMap.entries()).map(([type, items]) => ({
    type,
    items,
  }));

  return (
    <aside
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Question Map
      </h3>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        {answeredCount}/{total} answered, {flaggedIds.size} flagged
      </p>
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
        {grouped.map((group) => (
          <section key={group.type} className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              {TYPE_LABELS[group.type]}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(2rem,1fr))] gap-2 px-1 py-1">
              {group.items.map((item) => {
                const isAnswered = answeredIds.has(item.id);
                const isFlagged = flaggedIds.has(item.id);
                const isCurrent = currentIndex === item.index;

                return (
                  <button
                    key={item.id}
                    onClick={() => onJump(item.index)}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-full border text-[11px] transition",
                      isAnswered
                        ? "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                        : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300",
                      isCurrent &&
                        "ring-2 ring-emerald-400 ring-offset-1 dark:ring-offset-slate-900",
                      isFlagged &&
                        "border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
                    )}
                    aria-label={`Go to question ${item.index + 1}`}
                  >
                    {item.index + 1}
                    {isFlagged && (
                      <Flag className="absolute -right-1 -top-1 h-2.5 w-2.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
