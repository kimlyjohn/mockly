import { db } from "@/lib/db";
import { mapExamFromDb } from "@/lib/exam-mappers";
import { fail, ok, readJson } from "@/lib/http";
import { examInclude } from "@/lib/query-shapes";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ examId: string }>;
}

const updateExamSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .refine(
    (value) => value.title !== undefined || value.description !== undefined,
    {
      message: "At least one field is required.",
    },
  );

export async function GET(_: Request, context: RouteContext) {
  const { examId } = await context.params;

  const exam = await db.exam.findUnique({
    where: { id: examId },
    include: examInclude,
  });

  if (!exam) {
    return fail("Exam not found.", 404);
  }

  return ok({
    id: exam.id,
    exam: mapExamFromDb(exam),
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const { examId } = await context.params;

  const raw = await readJson<unknown>(request);
  const parsed = updateExamSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Invalid request payload.", 400, parsed.error.flatten());
  }

  const existing = await db.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });

  if (!existing) {
    return fail("Exam not found.", 404);
  }

  const updated = await db.exam.update({
    where: { id: examId },
    data: {
      ...(parsed.data.title !== undefined
        ? { title: parsed.data.title.trim() }
        : {}),
      ...(parsed.data.description !== undefined
        ? { description: parsed.data.description.trim() }
        : {}),
    },
  });

  return ok({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    updatedAt: updated.updatedAt,
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { examId } = await context.params;

  const existing = await db.exam.findUnique({
    where: { id: examId },
    select: { id: true },
  });

  if (!existing) {
    return fail("Exam not found.", 404);
  }

  await db.exam.delete({
    where: { id: examId },
  });

  return ok({
    deleted: true,
    id: examId,
  });
}
