import { db } from "@/lib/db";
import { mapExamFromDb, themeFromDb } from "@/lib/exam-mappers";
import { ok } from "@/lib/http";
import { examInclude } from "@/lib/query-shapes";

export async function GET() {
  const [exams, settings] = await Promise.all([
    db.exam.findMany({
      orderBy: { createdAt: "asc" },
      include: examInclude,
    }),
    db.appSettings.findUnique({ where: { id: 1 } }),
  ]);

  return ok({
    exportedAt: new Date().toISOString(),
    exams: exams.map((exam) => mapExamFromDb(exam)),
    settings: settings
      ? {
          theme: themeFromDb(settings.theme),
          autosaveSeconds: settings.autosaveSeconds,
          enableRetryIncorrect: settings.enableRetryIncorrect,
          enableKeyboardShortcuts: settings.enableKeyboardShortcuts,
        }
      : undefined,
  });
}
