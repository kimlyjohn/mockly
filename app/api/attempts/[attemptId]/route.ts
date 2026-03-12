import { AttemptStatus } from "@/app/generated/prisma/client";

import { saveAttemptProgressSchema } from "@/lib/api-schema";
import { db } from "@/lib/db";
import {
  mapAnswerFromDbRows,
  mapAnswerToDbRows,
  mapExamFromDb,
  statusFromDb,
} from "@/lib/exam-mappers";
import { fail, ok, readJson, serverFail, zodFail } from "@/lib/http";
import { attemptInclude, examInclude } from "@/lib/query-shapes";

interface RouteContext {
  params: Promise<{ attemptId: string }>;
}

const upsertAttemptAnswers = async (
  attemptId: string,
  questionIdMap: Map<string, string>,
  answers: Record<string, string | string[] | Record<string, string>>,
) => {
  for (const [externalQuestionId, answer] of Object.entries(answers)) {
    const dbQuestionId = questionIdMap.get(externalQuestionId);
    if (!dbQuestionId) {
      continue;
    }

    const mapped = mapAnswerToDbRows(answer);

    await db.$transaction(async (tx) => {
      const upserted = await tx.attemptAnswer.upsert({
        where: {
          attemptId_questionId: {
            attemptId,
            questionId: dbQuestionId,
          },
        },
        create: {
          attemptId,
          questionId: dbQuestionId,
          textValue: mapped.textValue,
        },
        update: {
          textValue: mapped.textValue,
        },
      });

      await tx.attemptAnswerItem.deleteMany({
        where: {
          attemptAnswerId: upserted.id,
        },
      });

      if (mapped.entries.length) {
        await tx.attemptAnswerItem.createMany({
          data: mapped.entries.map((entry) => ({
            attemptAnswerId: upserted.id,
            itemKey: entry.itemKey,
            itemValue: entry.itemValue,
            orderIndex: entry.orderIndex,
          })),
        });
      }
    });
  }
};

export async function GET(_: Request, context: RouteContext) {
  try {
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

    const questionIdMap = new Map(
      attempt.exam.questions.map((question) => [
        question.id,
        question.questionId,
      ]),
    );

    const answers = Object.fromEntries(
      attempt.answers
        .map((answer) => {
          const externalQuestionId = questionIdMap.get(answer.questionId);
          const mappedAnswer = mapAnswerFromDbRows(answer);
          if (!externalQuestionId || mappedAnswer === undefined) {
            return null;
          }
          return [externalQuestionId, mappedAnswer] as const;
        })
        .filter(
          (
            item,
          ): item is readonly [
            string,
            string | string[] | Record<string, string>,
          ] => item !== null,
        ),
    );

    return ok({
      id: attempt.id,
      examId: attempt.examId,
      status: statusFromDb(attempt.status),
      mode: attempt.mode,
      currentQuestionIndex: attempt.currentQuestionIndex,
      elapsedSeconds: attempt.elapsedSeconds,
      submittedAt: attempt.submittedAt,
      totalScore: attempt.totalScore,
      maxScore: attempt.maxScore,
      percentage: attempt.percentage,
      sourceAttemptId: attempt.sourceAttemptId,
      flaggedQuestionIds: attempt.flags.map((flag) => flag.questionId),
      answers,
      exam: mapExamFromDb(attempt.exam),
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
    });
  } catch (error) {
    return serverFail(error, "Failed to load attempt.");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { attemptId } = await context.params;

    const attempt = await db.attempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!attempt) {
      return fail("Attempt not found.", 404);
    }

    if (attempt.status !== AttemptStatus.IN_PROGRESS) {
      return fail("Only in-progress attempts can be updated.", 409);
    }

    const raw = await readJson<unknown>(request);
    const parsed = saveAttemptProgressSchema.safeParse(raw);
    if (!parsed.success) {
      return zodFail(parsed.error);
    }

    const questionIdMap = new Map(
      attempt.exam.questions.map((question) => [
        question.questionId,
        question.id,
      ]),
    );

    await upsertAttemptAnswers(attemptId, questionIdMap, parsed.data.answers);

    await db.$transaction([
      db.attempt.update({
        where: { id: attemptId },
        data: {
          currentQuestionIndex: parsed.data.currentQuestionIndex,
          elapsedSeconds: parsed.data.elapsedSeconds,
        },
      }),
      db.attemptFlag.deleteMany({ where: { attemptId } }),
      ...(parsed.data.flaggedQuestionIds.length
        ? [
            db.attemptFlag.createMany({
              data: parsed.data.flaggedQuestionIds.map((questionId) => ({
                attemptId,
                questionId,
              })),
            }),
          ]
        : []),
    ]);

    const updated = await db.attempt.findUnique({
      where: { id: attemptId },
      include: attemptInclude,
    });

    if (!updated) {
      return fail("Attempt no longer exists.", 404);
    }

    return ok({
      id: updated.id,
      status: statusFromDb(updated.status),
      currentQuestionIndex: updated.currentQuestionIndex,
      elapsedSeconds: updated.elapsedSeconds,
      flaggedQuestionIds: updated.flags.map((flag) => flag.questionId),
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    return serverFail(error, "Failed to save progress.");
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { attemptId } = await context.params;

    const existing = await db.attempt.findUnique({
      where: { id: attemptId },
      select: { id: true },
    });

    if (!existing) {
      return fail("Attempt not found.", 404);
    }

    await db.attempt.delete({
      where: { id: attemptId },
    });

    return ok({
      id: existing.id,
      deleted: true,
    });
  } catch (error) {
    return serverFail(error, "Failed to delete attempt.");
  }
}
