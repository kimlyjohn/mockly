import { db } from "@/lib/db";
import {
  mapAttemptMode,
  mapExamFromDb,
  statusFromDb,
} from "@/lib/exam-mappers";
import { fail, ok, readJson, serverFail, zodFail } from "@/lib/http";
import { attemptInclude, examInclude } from "@/lib/query-shapes";
import { startAttemptRequestSchema } from "@/lib/api-schema";

interface RouteContext {
  params: Promise<{ examId: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { examId } = await context.params;

    const attempts = await db.attempt.findMany({
      where: { examId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            answers: true,
          },
        },
      },
    });

    return ok(
      attempts.map((attempt) => ({
        id: attempt.id,
        status: statusFromDb(attempt.status),
        mode: attempt.mode,
        currentQuestionIndex: attempt.currentQuestionIndex,
        elapsedSeconds: attempt.elapsedSeconds,
        submittedAt: attempt.submittedAt,
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        answersCount: attempt._count.answers,
        createdAt: attempt.createdAt,
        updatedAt: attempt.updatedAt,
      })),
    );
  } catch (error) {
    return serverFail(error, "Failed to load exam attempt history.");
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { examId } = await context.params;

    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: examInclude,
    });

    if (!exam) {
      return fail("Exam not found.", 404);
    }

    const raw = await readJson<unknown>(request);
    const parsed = startAttemptRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return zodFail(parsed.error);
    }

    const mode = mapAttemptMode(parsed.data.mode);

    const created = await db.attempt.create({
      data: {
        examId,
        mode,
        sourceAttemptId: parsed.data.sourceAttemptId,
      },
      include: attemptInclude,
    });

    const mappedExam = mapExamFromDb(exam);

    return ok(
      {
        attempt: {
          id: created.id,
          status: statusFromDb(created.status),
          mode: created.mode,
          currentQuestionIndex: created.currentQuestionIndex,
          elapsedSeconds: created.elapsedSeconds,
          flaggedQuestionIds: created.flags.map((flag) => flag.questionId),
        },
        exam: mappedExam,
      },
      201,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unexpected server error while starting attempt.";

    return fail(message, 500);
  }
}
