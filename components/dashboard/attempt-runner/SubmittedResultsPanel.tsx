"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { ReviewQuestionCard } from "@/components/review/ReviewQuestionCard";
import { ScoreCard } from "@/components/review/ScoreCard";
import { Button } from "@/components/ui/Button";
import type { Exam, Question, UserAnswer } from "@/types/exam";
import type { ExamGradeResult } from "@/lib/grading";

const TYPE_LABELS: Record<Question["type"], string> = {
  true_false: "True/False",
  multiple_choice: "Multiple Choice",
  identification: "Identification",
  matching: "Matching",
  enumeration: "Enumeration",
};

type TabKey = "all" | Question["type"];

interface SubmittedResultsPanelProps {
  exam: Exam;
  answers: Record<string, UserAnswer>;
  grade: ExamGradeResult;
  onRetake: () => void;
  retaking: boolean;
}

export function SubmittedResultsPanel({
  exam,
  answers,
  grade,
  onRetake,
  retaking,
}: SubmittedResultsPanelProps) {
  const [tab, setTab] = useState<TabKey>("all");

  const grouped = useMemo(() => {
    return exam.questions.reduce<Record<Question["type"], Question[]>>(
      (acc, question) => {
        acc[question.type].push(question);
        return acc;
      },
      {
        true_false: [],
        multiple_choice: [],
        identification: [],
        matching: [],
        enumeration: [],
      },
    );
  }, [exam.questions]);

  const visibleQuestions = useMemo(() => {
    if (tab === "all") {
      return exam.questions;
    }
    return grouped[tab];
  }, [exam.questions, grouped, tab]);

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: "all", label: "All", count: exam.questions.length },
    ...Object.entries(grouped)
      .filter(([, questions]) => questions.length > 0)
      .map(([key, questions]) => ({
        key: key as Question["type"],
        label: TYPE_LABELS[key as Question["type"]],
        count: questions.length,
      })),
  ];

  return (
    <section className="flex flex-col gap-4 pb-8">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-8">
        <ScoreCard
          percentage={grade.percentage}
          totalScore={grade.totalScore}
          maxScore={grade.maxScore}
          passingScore={exam.metadata.passingScore}
          questions={exam.questions}
        />
      </div>

      <div className="sticky top-0 z-40 -mx-4 border-y border-slate-200/70 bg-white shadow-sm sm:-mx-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={[
                  "rounded-lg border px-2.5 py-1 text-[11px] font-medium transition sm:px-3 sm:text-xs",
                  tab === item.key
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                    : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
                ].join(" ")}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>

          <Button
            onClick={onRetake}
            disabled={retaking}
            size="sm"
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="shrink-0"
          >
            {retaking ? "Starting new attempt..." : "Retake Exam"}
          </Button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-3 px-4 sm:px-8">
        {visibleQuestions.map((question, index) => {
          const overallIndex = exam.questions.findIndex(
            (q) => q.id === question.id,
          );
          return (
            <ReviewQuestionCard
              key={question.id}
              index={overallIndex === -1 ? index : overallIndex}
              question={question}
              userAnswer={answers[question.id]}
              grade={grade.perQuestion[question.id]}
            />
          );
        })}
      </div>
    </section>
  );
}
