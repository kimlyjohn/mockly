"use client";

import { useMemo, useState } from "react";

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
    <section className="space-y-4">
      <ScoreCard
        percentage={grade.percentage}
        totalScore={grade.totalScore}
        maxScore={grade.maxScore}
        passingScore={exam.metadata.passingScore}
        questions={exam.questions}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={[
                "rounded-lg border px-3 py-1 text-xs font-medium transition",
                tab === item.key
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
              ].join(" ")}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>

        <Button onClick={onRetake} disabled={retaking}>
          {retaking ? "Starting new attempt..." : "Retake Exam"}
        </Button>
      </div>

      <div className="space-y-3">
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
