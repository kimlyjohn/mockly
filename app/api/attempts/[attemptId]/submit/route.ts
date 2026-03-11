import { AttemptStatus } from "@/app/generated/prisma/client";

import { db } from "@/lib/db";
import {
  mapAnswerFromDbRows,
  mapExamFromDb,
  mapQuestionFromDb,
  statusFromDb,
} from "@/lib/exam-mappers";
import { gradeExam } from "@/lib/grading";
import { fail, ok } from "@/lib/http";
import { attemptInclude, examInclude } from "@/lib/query-shapes";

interface RouteContext {
  params: Promise<{ attemptId: string }>;
}

export async function POST(_: Request, context: RouteContext) {
  const { attemptId } = await context.params;

  const attempt = await db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      ...attemptInclude,
      exam: {
        include: examInclude,
      },
    },
  });

  if (!attempt) {
    return fail("Attempt not found.", 404);
  }

  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    return fail("Attempt is already submitted.", 409);
  }

  const examQuestions = attempt.exam.questions
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(mapQuestionFromDb);
  const questionIdMap = new Map(
    attempt.exam.questions.map((question) => [
      question.id,
      question.questionId,
    ]),
  );

  const userAnswers = Object.fromEntries(
    attempt.answers
      .map((answer) => {
        const externalQuestionId = questionIdMap.get(answer.questionId);
        const mapped = mapAnswerFromDbRows(answer);
        if (!externalQuestionId || mapped === undefined) {
          return null;
        }
        return [externalQuestionId, mapped] as const;
      })
      .filter(
        (
          entry,
        ): entry is readonly [
          string,
          string | string[] | Record<string, string>,
        ] => entry !== null,
      ),
  );

  const grade = gradeExam(examQuestions, userAnswers);

  const submitted = await db.attempt.update({
    where: { id: attemptId },
    data: {
      status: AttemptStatus.SUBMITTED,
      submittedAt: new Date(),
      totalScore: grade.totalScore,
      maxScore: grade.maxScore,
      percentage: grade.percentage,
    },
    include: attemptInclude,
  });

  return ok({
    attempt: {
      id: submitted.id,
      status: statusFromDb(submitted.status),
      submittedAt: submitted.submittedAt,
      currentQuestionIndex: submitted.currentQuestionIndex,
      elapsedSeconds: submitted.elapsedSeconds,
      flaggedQuestionIds: submitted.flags.map((flag) => flag.questionId),
      grade,
      createdAt: submitted.createdAt,
      updatedAt: submitted.updatedAt,
    },
    exam: mapExamFromDb(attempt.exam),
  });
}
