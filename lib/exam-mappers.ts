import { createHash } from "node:crypto";

import {
  AttemptMode,
  AttemptStatus,
  QuestionType as PrismaQuestionType,
  ThemeSetting,
  type Attempt,
  type AttemptAnswer,
  type AttemptAnswerItem,
  type AttemptFlag,
  type Question,
  type QuestionOption,
  type MatchingPair,
  type EnumerationItem,
} from "@/app/generated/prisma/client";

import type { Exam, Question as ExamQuestion, UserAnswer } from "@/types/exam";

type QuestionWithRelations = Question & {
  options: QuestionOption[];
  matchingPairs: MatchingPair[];
  enumerationRows: EnumerationItem[];
};

type AttemptAnswerWithItems = AttemptAnswer & {
  entries: AttemptAnswerItem[];
};

type AttemptWithRelations = Attempt & {
  answers: AttemptAnswerWithItems[];
  flags: AttemptFlag[];
};

export const examHash = (exam: Exam): string => {
  const normalized = JSON.stringify(exam);
  return createHash("sha256").update(normalized).digest("hex");
};

const toPrismaQuestionType = (
  type: ExamQuestion["type"],
): PrismaQuestionType => {
  switch (type) {
    case "true_false":
      return PrismaQuestionType.TRUE_FALSE;
    case "multiple_choice":
      return PrismaQuestionType.MULTIPLE_CHOICE;
    case "identification":
      return PrismaQuestionType.IDENTIFICATION;
    case "matching":
      return PrismaQuestionType.MATCHING;
    case "enumeration":
      return PrismaQuestionType.ENUMERATION;
  }
};

export const mapExamToCreateInput = (exam: Exam) => {
  return {
    title: exam.title,
    description: exam.description,
    subject: exam.metadata.subject,
    totalQuestions: exam.metadata.totalQuestions,
    passingScore: exam.metadata.passingScore,
    shuffleQuestions: exam.metadata.shuffleQuestions ?? false,
    shuffleOptions: exam.metadata.shuffleOptions ?? false,
    sourceHash: examHash(exam),
    questions: {
      create: exam.questions.map((question, index) => {
        const base = {
          questionId: question.id,
          orderIndex: index,
          type: toPrismaQuestionType(question.type),
          prompt: question.prompt,
          explanation: question.explanation,
        };

        if (question.type === "true_false") {
          return {
            ...base,
            boolAnswer: question.correctAnswer === "true",
          };
        }

        if (question.type === "multiple_choice") {
          return {
            ...base,
            textAnswer: question.correctAnswer,
            options: {
              create: question.options.map((value, optionIndex) => ({
                value,
                orderIndex: optionIndex,
              })),
            },
          };
        }

        if (question.type === "identification") {
          return {
            ...base,
            hasChoices: question.hasChoices,
            textAnswer: question.correctAnswer,
            options: question.hasChoices
              ? {
                  create: question.options.map((value, optionIndex) => ({
                    value,
                    orderIndex: optionIndex,
                  })),
                }
              : undefined,
          };
        }

        if (question.type === "matching") {
          return {
            ...base,
            matchingPairs: {
              create: question.options.left.map((left, pairIndex) => ({
                leftValue: left,
                rightValue: question.correctAnswer[left] ?? "",
                orderIndex: pairIndex,
              })),
            },
          };
        }

        return {
          ...base,
          orderedAnswer: question.orderedAnswer ?? false,
          enumerationRows: {
            create: question.correctAnswer.map((value, enumIndex) => ({
              value,
              orderIndex: enumIndex,
            })),
          },
        };
      }),
    },
  };
};

const fromPrismaQuestionType = (
  type: PrismaQuestionType,
): ExamQuestion["type"] => {
  switch (type) {
    case PrismaQuestionType.TRUE_FALSE:
      return "true_false";
    case PrismaQuestionType.MULTIPLE_CHOICE:
      return "multiple_choice";
    case PrismaQuestionType.IDENTIFICATION:
      return "identification";
    case PrismaQuestionType.MATCHING:
      return "matching";
    case PrismaQuestionType.ENUMERATION:
      return "enumeration";
  }
};

export const mapQuestionFromDb = (
  question: QuestionWithRelations,
): ExamQuestion => {
  const type = fromPrismaQuestionType(question.type);

  if (type === "true_false") {
    return {
      id: question.questionId,
      type,
      prompt: question.prompt,
      explanation: question.explanation,
      correctAnswer: question.boolAnswer ? "true" : "false",
    };
  }

  if (type === "multiple_choice") {
    return {
      id: question.questionId,
      type,
      prompt: question.prompt,
      explanation: question.explanation,
      options: question.options
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((opt) => opt.value),
      correctAnswer: question.textAnswer ?? "",
    };
  }

  if (type === "identification") {
    const options = question.options
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((opt) => opt.value);

    if (question.hasChoices) {
      return {
        id: question.questionId,
        type,
        prompt: question.prompt,
        explanation: question.explanation,
        hasChoices: true,
        options,
        correctAnswer: question.textAnswer ?? "",
      };
    }

    return {
      id: question.questionId,
      type,
      prompt: question.prompt,
      explanation: question.explanation,
      hasChoices: false,
      correctAnswer: question.textAnswer ?? "",
    };
  }

  if (type === "matching") {
    const pairs = question.matchingPairs.sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    const left = pairs.map((pair) => pair.leftValue);
    const right = pairs.map((pair) => pair.rightValue);

    return {
      id: question.questionId,
      type,
      prompt: question.prompt,
      explanation: question.explanation,
      options: {
        left,
        right,
      },
      correctAnswer: Object.fromEntries(
        pairs.map((pair) => [pair.leftValue, pair.rightValue]),
      ),
    };
  }

  return {
    id: question.questionId,
    type,
    prompt: question.prompt,
    explanation: question.explanation,
    orderedAnswer: question.orderedAnswer ?? false,
    correctAnswer: question.enumerationRows
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((row) => row.value),
  };
};

export const mapExamFromDb = (payload: {
  title: string;
  description: string;
  subject: string | null;
  totalQuestions: number;
  passingScore: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  questions: QuestionWithRelations[];
}): Exam => {
  const questions = payload.questions
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(mapQuestionFromDb);

  return {
    title: payload.title,
    description: payload.description,
    metadata: {
      totalQuestions: payload.totalQuestions,
      passingScore: payload.passingScore,
      subject: payload.subject ?? undefined,
      shuffleQuestions: payload.shuffleQuestions,
      shuffleOptions: payload.shuffleOptions,
    },
    questions,
  };
};

export const mapAnswerToDbRows = (
  answer: UserAnswer,
): {
  textValue: string | null;
  entries: Array<{
    itemKey: string | null;
    itemValue: string;
    orderIndex: number;
  }>;
} => {
  if (typeof answer === "string") {
    return {
      textValue: answer,
      entries: [],
    };
  }

  if (Array.isArray(answer)) {
    return {
      textValue: null,
      entries: answer.map((value, index) => ({
        itemKey: null,
        itemValue: value,
        orderIndex: index,
      })),
    };
  }

  const entries = Object.entries(answer).map(([key, value], index) => ({
    itemKey: key,
    itemValue: value,
    orderIndex: index,
  }));

  return {
    textValue: null,
    entries,
  };
};

export const mapAnswerFromDbRows = (
  answer: AttemptAnswerWithItems,
): UserAnswer | undefined => {
  if (answer.textValue !== null && answer.textValue !== undefined) {
    return answer.textValue;
  }

  if (!answer.entries.length) {
    return undefined;
  }

  const sorted = [...answer.entries].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );
  const hasKeys = sorted.some((entry) => entry.itemKey !== null);

  if (hasKeys) {
    return Object.fromEntries(
      sorted.map((entry) => [entry.itemKey ?? "", entry.itemValue]),
    );
  }

  return sorted.map((entry) => entry.itemValue);
};

export const mapAttemptMode = (
  mode: "normal" | "retry_incorrect",
): AttemptMode => {
  return mode === "retry_incorrect"
    ? AttemptMode.RETRY_INCORRECT
    : AttemptMode.NORMAL;
};

export const mapThemeSetting = (
  theme: "system" | "light" | "dark",
): ThemeSetting => {
  if (theme === "light") {
    return ThemeSetting.LIGHT;
  }
  if (theme === "dark") {
    return ThemeSetting.DARK;
  }
  return ThemeSetting.LIGHT;
};

export const themeFromDb = (theme: ThemeSetting): "light" | "dark" => {
  if (theme === ThemeSetting.LIGHT) {
    return "light";
  }
  if (theme === ThemeSetting.DARK) {
    return "dark";
  }
  return "light";
};

export const statusFromDb = (
  status: AttemptStatus,
): "in_progress" | "submitted" | "abandoned" => {
  if (status === AttemptStatus.SUBMITTED) {
    return "submitted";
  }
  if (status === AttemptStatus.ABANDONED) {
    return "abandoned";
  }
  return "in_progress";
};

export type { AttemptWithRelations, QuestionWithRelations };
