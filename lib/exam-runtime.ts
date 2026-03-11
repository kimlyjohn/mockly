import type { Exam, Question } from "@/types/exam";

const cloneQuestion = (question: Question): Question => {
  if (question.type !== "matching") {
    return { ...question };
  }

  return {
    ...question,
    options: {
      left: [...question.options.left],
      right: [...question.options.right],
    },
    correctAnswer: { ...question.correctAnswer },
  };
};

const shuffleArray = <T>(input: T[]): T[] => {
  const output = [...input];
  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }
  return output;
};

const normalizeQuestionForLoad = (
  question: Question,
  shuffleOptions: boolean,
): Question => {
  const cloned = cloneQuestion(question);

  if (cloned.type === "matching") {
    return {
      ...cloned,
      options: {
        ...cloned.options,
        right: shuffleArray(cloned.options.right),
      },
    };
  }

  if (
    shuffleOptions &&
    ((cloned.type === "multiple_choice" && cloned.options.length > 1) ||
      (cloned.type === "identification" &&
        cloned.hasChoices &&
        cloned.options.length > 1))
  ) {
    return {
      ...cloned,
      options: shuffleArray(cloned.options),
    };
  }

  return cloned;
};

export const normalizeExamForLoad = (exam: Exam): Exam => {
  const questions = exam.questions.map((q) =>
    normalizeQuestionForLoad(q, !!exam.metadata.shuffleOptions),
  );
  const normalizedQuestions = exam.metadata.shuffleQuestions
    ? shuffleArray(questions)
    : questions;

  return {
    ...exam,
    questions: normalizedQuestions,
    metadata: {
      ...exam.metadata,
      totalQuestions: normalizedQuestions.length,
    },
  };
};

export const saveSessionToStorage = (key: string, payload: unknown): void => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(payload));
  }
};

export const readSessionFromStorage = <T>(key: string): T | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
};

export const clearSessionFromStorage = (key: string): void => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
};
