import { AttemptStatus } from "@/app/generated/prisma/client";

import { db } from "@/lib/db";
import { statusFromDb, themeFromDb } from "@/lib/exam-mappers";

export const listExams = async () => {
  return db.exam.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          attempts: true,
        },
      },
    },
  });
};

export const listExamsPaginated = async (page = 1, pageSize = 12) => {
  const safePageSize = Math.max(1, Math.min(100, pageSize));
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * safePageSize;

  const [items, total] = await Promise.all([
    db.exam.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: safePageSize,
      include: {
        _count: {
          select: {
            attempts: true,
          },
        },
      },
    }),
    db.exam.count(),
  ]);

  return {
    items,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
};

export const getExamDetails = async (examId: string) => {
  return db.exam.findUnique({
    where: { id: examId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
      },
      attempts: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

export const listAttempts = async () => {
  const attempts = await db.attempt.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          subject: true,
          passingScore: true,
        },
      },
      _count: {
        select: {
          answers: true,
          flags: true,
        },
      },
    },
  });

  return attempts.map((attempt) => ({
    id: attempt.id,
    examId: attempt.examId,
    examTitle: attempt.exam.title,
    examSubject: attempt.exam.subject,
    examPassingScore: attempt.exam.passingScore,
    status: statusFromDb(attempt.status),
    mode: attempt.mode,
    currentQuestionIndex: attempt.currentQuestionIndex,
    elapsedSeconds: attempt.elapsedSeconds,
    totalScore: attempt.totalScore,
    maxScore: attempt.maxScore,
    percentage: attempt.percentage,
    answersCount: attempt._count.answers,
    flagsCount: attempt._count.flags,
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
    submittedAt: attempt.submittedAt,
  }));
};

export type AttemptFilterStatus = "in_progress" | "submitted" | "abandoned";

export const listAttemptsPaginated = async (
  page = 1,
  pageSize = 8,
  status?: AttemptFilterStatus,
) => {
  const safePageSize = Math.max(1, Math.min(100, pageSize));
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * safePageSize;

  const statusWhere =
    status === "in_progress"
      ? AttemptStatus.IN_PROGRESS
      : status === "submitted"
        ? AttemptStatus.SUBMITTED
        : status === "abandoned"
          ? AttemptStatus.ABANDONED
          : undefined;

  const where = statusWhere ? { status: statusWhere } : undefined;

  const [items, total] = await Promise.all([
    db.attempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: safePageSize,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            subject: true,
            passingScore: true,
          },
        },
        _count: {
          select: {
            answers: true,
            flags: true,
          },
        },
      },
    }),
    db.attempt.count({ where }),
  ]);

  return {
    items: items.map((attempt) => ({
      id: attempt.id,
      examId: attempt.examId,
      examTitle: attempt.exam.title,
      examSubject: attempt.exam.subject,
      examPassingScore: attempt.exam.passingScore,
      status: statusFromDb(attempt.status),
      mode: attempt.mode,
      currentQuestionIndex: attempt.currentQuestionIndex,
      elapsedSeconds: attempt.elapsedSeconds,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      answersCount: attempt._count.answers,
      flagsCount: attempt._count.flags,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
      submittedAt: attempt.submittedAt,
    })),
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  };
};

export const getAttemptDetails = async (attemptId: string) => {
  return db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
      answers: {
        include: {
          entries: {
            orderBy: { orderIndex: "asc" },
          },
          question: {
            select: {
              questionId: true,
              prompt: true,
              type: true,
            },
          },
        },
      },
      flags: true,
    },
  });
};

export const getSettings = async () => {
  const settings = await db.appSettings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });

  return {
    theme: themeFromDb(settings.theme),
    autosaveSeconds: settings.autosaveSeconds,
    enableRetryIncorrect: settings.enableRetryIncorrect,
    enableKeyboardShortcuts: settings.enableKeyboardShortcuts,
    updatedAt: settings.updatedAt,
  };
};

export const formatAttemptState = (status: AttemptStatus): string => {
  return statusFromDb(status).replaceAll("_", " ");
};
