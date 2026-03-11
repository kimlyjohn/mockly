import { Prisma } from "@/app/generated/prisma/client";

import { importExamRequestSchema } from "@/lib/api-schema";
import { db } from "@/lib/db";
import { mapExamFromDb, mapExamToCreateInput } from "@/lib/exam-mappers";
import { fail, ok, readJson, zodFail } from "@/lib/http";
import { examInclude } from "@/lib/query-shapes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = Number.parseInt(searchParams.get("pageSize") ?? "12", 10);
  const safePage = Number.isFinite(page) ? Math.max(1, page) : 1;
  const safePageSize = Number.isFinite(pageSize)
    ? Math.max(1, Math.min(100, pageSize))
    : 12;
  const skip = (safePage - 1) * safePageSize;

  const [exams, total] = await Promise.all([
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

  return ok({
    items: exams.map((exam) => ({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      subject: exam.subject,
      totalQuestions: exam.totalQuestions,
      passingScore: exam.passingScore,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      attemptsCount: exam._count.attempts,
    })),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / safePageSize)),
  });
}

export async function POST(request: Request) {
  try {
    const raw = await readJson<unknown>(request);
    const parsed = importExamRequestSchema.safeParse(raw);
    if (!parsed.success) {
      return zodFail(parsed.error);
    }

    const { exam, filename, source, rawSize } = parsed.data;

    const created = await db.exam.create({
      data: {
        ...mapExamToCreateInput(exam),
        imports: {
          create: {
            filename,
            source,
            rawSize,
          },
        },
      },
      include: examInclude,
    });

    return ok(
      {
        id: created.id,
        exam: mapExamFromDb(created),
      },
      201,
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return fail(
        "This exam already exists in your library. Import a different file or modify the content.",
        409,
      );
    }

    return fail("Failed to import exam.", 500);
  }
}
