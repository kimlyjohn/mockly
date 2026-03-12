"use client";

import { Loader2 } from "lucide-react";

import { ExamFooter } from "@/components/exam-player/ExamFooter";
import { ExamHeader } from "@/components/exam-player/ExamHeader";
import { QuestionNavigator } from "@/components/exam-player/QuestionNavigator";
import { QuestionRenderer } from "@/components/exam-player/QuestionRenderer";
import { Card } from "@/components/ui/card";
import type { Exam, Question, UserAnswer } from "@/types/exam";

interface AttemptInProgressViewProps {
  exam: Exam;
  currentQuestion: Question;
  questions: Question[];
  currentQuestionIndex: number;
  elapsedTimeText: string;
  saving: boolean;
  answers: Record<string, UserAnswer>;
  flagged: Set<string>;
  answeredCount: number;
  unansweredCount: number;
  navigatorOpen: boolean;
  keyboardEnabled: boolean;
  onChangeAnswer: (answer: UserAnswer) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onJump: (index: number) => void;
  onToggleNavigator: () => void;
  onToggleFlag: () => void;
}

export function AttemptInProgressView({
  exam,
  currentQuestion,
  questions,
  currentQuestionIndex,
  elapsedTimeText,
  saving,
  answers,
  flagged,
  answeredCount,
  unansweredCount,
  navigatorOpen,
  keyboardEnabled,
  onChangeAnswer,
  onPrev,
  onNext,
  onSubmit,
  onJump,
  onToggleNavigator,
  onToggleFlag,
}: AttemptInProgressViewProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
        <span>Time elapsed: {elapsedTimeText}</span>
        {saving && (
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        )}
      </div>

      <div
        className={`grid items-start gap-4 transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none ${
          navigatorOpen
            ? "md:grid-cols-[minmax(0,1fr)_20rem]"
            : "md:grid-cols-[minmax(0,1fr)_0rem]"
        }`}
      >
        <div className="min-w-0 space-y-4">
          <ExamHeader
            title={exam.title}
            currentIndex={currentQuestionIndex}
            answeredCount={answeredCount}
            total={questions.length}
            isNavigatorOpen={navigatorOpen}
            isCurrentFlagged={flagged.has(currentQuestion.id)}
            onToggleNavigator={onToggleNavigator}
            onToggleFlag={onToggleFlag}
          />

          <Card>
            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onChange={onChangeAnswer}
            />
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Tips: Use 1-9 for options, T/F for true-false, B to flag, and
              Ctrl/Cmd+Enter to submit.
            </p>
          </Card>

          <ExamFooter
            canGoPrev={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < questions.length - 1}
            canSubmitReady={unansweredCount === 0}
            onPrev={onPrev}
            onNext={onNext}
            onSubmit={onSubmit}
          />
        </div>

        <div
          className={`overflow-hidden transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            navigatorOpen
              ? "opacity-100"
              : "hidden md:block md:pointer-events-none md:opacity-0"
          }`}
        >
          <QuestionNavigator
            currentIndex={currentQuestionIndex}
            answeredIds={new Set(Object.keys(answers))}
            flaggedIds={flagged}
            questions={questions.map((q) => ({ id: q.id, type: q.type }))}
            visible
            onJump={onJump}
            className="w-full md:w-80 md:sticky md:top-4"
          />
        </div>
      </div>

      {!keyboardEnabled && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Keyboard shortcuts are disabled from settings.
        </p>
      )}
    </section>
  );
}
