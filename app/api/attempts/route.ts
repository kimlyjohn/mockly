import { db } from "@/lib/db";
import { statusFromDb } from "@/lib/exam-mappers";
import { ok } from "@/lib/http";

export async function GET() {
  const attempts = await db.attempt.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      exam: {
        select: {
          title: true,
          subject: true,
        },
      },
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
      examId: attempt.examId,
      examTitle: attempt.exam.title,
      examSubject: attempt.exam.subject,
      status: statusFromDb(attempt.status),
      mode: attempt.mode,
      currentQuestionIndex: attempt.currentQuestionIndex,
      elapsedSeconds: attempt.elapsedSeconds,
      percentage: attempt.percentage,
      submittedAt: attempt.submittedAt,
      answersCount: attempt._count.answers,
      createdAt: attempt.createdAt,
      updatedAt: attempt.updatedAt,
    })),
  );
}
