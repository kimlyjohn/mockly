"use client";

import { useMemo, useState } from "react";

import { ConfirmSubmitModal } from "@/components/ui/ConfirmSubmitModal";
import { Card } from "@/components/ui/card";
import { useKeyboardShortcuts } from "@/hooks/shared/useKeyboardShortcuts";
import type { Question } from "@/types/exam";
import { useExamStore } from "@/store/examStore";

import { ExamFooter } from "./ExamFooter";
import { ExamHeader } from "./ExamHeader";
import { QuestionNavigator } from "./QuestionNavigator";
import { QuestionRenderer } from "./QuestionRenderer";

export function ExamPlayer() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const {
    examData,
    userAnswers,
    currentQuestionIndex,
    goNext,
    goPrev,
    goToQuestion,
    setAnswer,
    submitExam,
    isNavigatorOpen,
    toggleNavigator,
    flaggedQuestions,
    toggleFlag,
    retryMode,
    retryQuestionIds,
  } = useExamStore();

  const questions = useMemo(() => {
    if (!examData) {
      return [] as Question[];
    }
    if (!retryMode) {
      return examData.questions;
    }
    return examData.questions.filter((question) =>
      retryQuestionIds.includes(question.id),
    );
  }, [examData, retryMode, retryQuestionIds]);

  const question = questions[currentQuestionIndex];

  const unansweredCount = questions.filter(
    (q) => userAnswers[q.id] === undefined,
  ).length;
  const answeredCount = questions.length - unansweredCount;
  const flaggedCount = questions.filter((q) =>
    flaggedQuestions.has(q.id),
  ).length;

  const mcqOptions =
    question?.type === "multiple_choice" ? question.options : null;

  const requestSubmit = () => {
    if (unansweredCount === 0 && flaggedCount === 0) {
      submitExam();
      return;
    }
    setIsSubmitModalOpen(true);
  };

  useKeyboardShortcuts({
    onPrev: goPrev,
    onNext: goNext,
    onSubmit: requestSubmit,
    onToggleFlag: () => question && toggleFlag(question.id),
    onSelectTf: (value) => {
      if (question?.type === "true_false") {
        setAnswer(question.id, value);
      }
    },
    onSelectMcqByIndex: (index) => {
      if (question?.type === "multiple_choice" && mcqOptions?.[index]) {
        setAnswer(question.id, mcqOptions[index]);
      }
    },
  });

  if (!examData || !question) {
    return null;
  }

  return (
    <div
      className={`grid items-start gap-4 transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none ${
        isNavigatorOpen
          ? "md:grid-cols-[minmax(0,1fr)_20rem]"
          : "md:grid-cols-1"
      }`}
    >
      <div className="space-y-4">
        <ExamHeader
          title={examData.title}
          currentIndex={currentQuestionIndex}
          answeredCount={answeredCount}
          total={questions.length}
          isNavigatorOpen={isNavigatorOpen}
          isCurrentFlagged={flaggedQuestions.has(question.id)}
          onToggleNavigator={toggleNavigator}
          onToggleFlag={() => toggleFlag(question.id)}
        />

        <Card className="min-h-72">
          <QuestionRenderer
            question={question}
            answer={userAnswers[question.id]}
            onChange={(answer) => setAnswer(question.id, answer)}
          />
        </Card>

        <ExamFooter
          canGoPrev={currentQuestionIndex > 0}
          canGoNext={currentQuestionIndex < questions.length - 1}
          canSubmitReady={unansweredCount === 0}
          onPrev={goPrev}
          onNext={goNext}
          onSubmit={requestSubmit}
        />
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none ${
          isNavigatorOpen
            ? "max-md:block md:w-80 md:translate-x-0 md:opacity-100"
            : "max-md:hidden md:w-0 md:translate-x-4 md:opacity-0 md:pointer-events-none"
        }`}
      >
        <QuestionNavigator
          currentIndex={currentQuestionIndex}
          answeredIds={new Set(Object.keys(userAnswers))}
          flaggedIds={flaggedQuestions}
          questions={questions.map((q) => ({ id: q.id, type: q.type }))}
          visible
          onJump={goToQuestion}
          className="md:sticky md:top-4"
        />
      </div>

      <ConfirmSubmitModal
        isOpen={isSubmitModalOpen}
        unansweredCount={unansweredCount}
        flaggedCount={flaggedCount}
        onCancel={() => setIsSubmitModalOpen(false)}
        onConfirm={() => {
          setIsSubmitModalOpen(false);
          submitExam();
        }}
      />
    </div>
  );
}
