"use client";

import { useKeyboardShortcuts } from "@/hooks/shared/useKeyboardShortcuts";
import type { Question, UserAnswer } from "@/types/exam";

interface UseAttemptShortcutsOptions {
  keyboardEnabled: boolean;
  currentQuestion: Question | undefined;
  questionsLength: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onToggleFlag: () => void;
  onSetAnswer: (questionId: string, answer: UserAnswer) => void;
}

export function useAttemptShortcuts({
  keyboardEnabled,
  currentQuestion,
  questionsLength,
  onPrev,
  onNext,
  onSubmit,
  onToggleFlag,
  onSetAnswer,
}: UseAttemptShortcutsOptions) {
  useKeyboardShortcuts({
    onPrev: () => {
      if (!keyboardEnabled) {
        return;
      }
      onPrev();
    },
    onNext: () => {
      if (!keyboardEnabled) {
        return;
      }
      onNext();
    },
    onSubmit: () => {
      if (!keyboardEnabled) {
        return;
      }
      onSubmit();
    },
    onToggleFlag: () => {
      if (!keyboardEnabled || !currentQuestion) {
        return;
      }
      onToggleFlag();
    },
    onSelectTf: (value) => {
      if (!keyboardEnabled || currentQuestion?.type !== "true_false") {
        return;
      }
      onSetAnswer(currentQuestion.id, value);
    },
    onSelectMcqByIndex: (index) => {
      if (!keyboardEnabled || currentQuestion?.type !== "multiple_choice") {
        return;
      }
      const option = currentQuestion.options[index];
      if (!option) {
        return;
      }
      onSetAnswer(currentQuestion.id, option);
    },
  });

  return {
    canNavigate: questionsLength > 0,
  };
}
