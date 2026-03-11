import { CheckCircle2, XCircle } from "lucide-react";

import type { Question, UserAnswer } from "@/types/exam";
import type { QuestionGradeResult } from "@/lib/grading";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const TYPE_LABELS: Record<Question["type"], string> = {
  true_false: "True/False",
  multiple_choice: "Multiple Choice",
  identification: "Identification",
  matching: "Matching",
  enumeration: "Enumeration",
};

const renderScalar = (value: string | undefined, emptyLabel: string) => (
  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
    {value?.trim() ? value : emptyLabel}
  </p>
);

const renderEnumeration = (
  values: string[],
  emptyLabel: string,
  ordered = false,
) => {
  const cleaned = values.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return renderScalar(undefined, emptyLabel);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {cleaned.map((item, idx) => (
          <Badge key={`${item}_${idx}`} variant="outline">
            {ordered ? `${idx + 1}. ${item}` : item}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {ordered ? "Order-sensitive answer" : "Order-insensitive answer"}
      </p>
    </div>
  );
};

const renderMatching = (
  map: Record<string, string>,
  emptyLabel: string,
  fallbackLeft?: string[],
) => {
  const pairs = Object.entries(map);
  if (pairs.length === 0) {
    if (fallbackLeft && fallbackLeft.length > 0) {
      return (
        <div className="space-y-1">
          {fallbackLeft.map((left) => (
            <p
              key={left}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            >
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {left}
              </span>{" "}
              {"->"} {emptyLabel}
            </p>
          ))}
        </div>
      );
    }

    return renderScalar(undefined, emptyLabel);
  }

  return (
    <div className="space-y-1">
      {pairs.map(([left, right]) => (
        <p
          key={left}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {left}
          </span>{" "}
          <span className="text-slate-500 dark:text-slate-400">{"->"}</span>{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-100">
            {right || emptyLabel}
          </span>
        </p>
      ))}
    </div>
  );
};

interface ReviewQuestionCardProps {
  index: number;
  question: Question;
  userAnswer: UserAnswer | undefined;
  grade: QuestionGradeResult;
}

export function ReviewQuestionCard({
  index,
  question,
  userAnswer,
  grade,
}: ReviewQuestionCardProps) {
  const renderUserAnswer = () => {
    if (question.type === "matching") {
      const matchingAnswer =
        userAnswer &&
        !Array.isArray(userAnswer) &&
        typeof userAnswer !== "string"
          ? (userAnswer as Record<string, string>)
          : {};
      return renderMatching(
        matchingAnswer,
        "(No match)",
        question.options.left,
      );
    }

    if (question.type === "enumeration") {
      const enumerationAnswer = Array.isArray(userAnswer)
        ? (userAnswer as string[])
        : [];
      return renderEnumeration(
        enumerationAnswer,
        "(No item)",
        question.orderedAnswer,
      );
    }

    return renderScalar(
      typeof userAnswer === "string" ? userAnswer : undefined,
      "(No answer)",
    );
  };

  const renderCorrectAnswer = () => {
    if (question.type === "matching") {
      return renderMatching(question.correctAnswer, "(No match)");
    }

    if (question.type === "enumeration") {
      return renderEnumeration(
        question.correctAnswer,
        "(No item)",
        question.orderedAnswer,
      );
    }

    return renderScalar(question.correctAnswer, "(No answer)");
  };

  return (
    <Card
      className={[
        "space-y-3 border-2",
        grade.isCorrect
          ? "border-emerald-200 dark:border-emerald-900"
          : "border-rose-200 dark:border-rose-900",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="text-[11px] uppercase tracking-[0.08em]"
            >
              {TYPE_LABELS[question.type]}
            </Badge>
            <Badge
              variant={grade.isCorrect ? "default" : "destructive"}
              className="text-[11px] uppercase tracking-[0.08em]"
            >
              {grade.isCorrect ? "Correct" : "Incorrect"}
            </Badge>
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {index + 1}. {question.prompt}
          </p>
        </div>

        <div className="mt-0.5">
          {grade.isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <XCircle className="h-5 w-5 text-rose-600" />
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Your answer:
          </p>
          {renderUserAnswer()}
        </div>
        <div className="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
          <p className="text-xs uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Correct answer:
          </p>
          {renderCorrectAnswer()}
        </div>
      </div>

      <div className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p className="font-bold">Explanation</p>
        <p className="mt-1">{question.explanation}</p>
      </div>

      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Score: {grade.score}/{grade.maxScore}
      </p>
    </Card>
  );
}
