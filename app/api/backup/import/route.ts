import { Prisma } from "@/app/generated/prisma/client";

import { backupImportSchema } from "@/lib/api-schema";
import { db } from "@/lib/db";
import { mapExamToCreateInput, mapThemeSetting } from "@/lib/exam-mappers";
import { ok, readJson, zodFail } from "@/lib/http";

export async function POST(request: Request) {
  const raw = await readJson<unknown>(request);
  const parsed = backupImportSchema.safeParse(raw);
  if (!parsed.success) {
    return zodFail(parsed.error);
  }

  let importedCount = 0;
  const skipped: string[] = [];

  for (const exam of parsed.data.exams) {
    try {
      await db.exam.create({
        data: {
          ...mapExamToCreateInput(exam),
          imports: {
            create: {
              source: "backup_import",
            },
          },
        },
      });
      importedCount += 1;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        skipped.push(exam.title);
        continue;
      }
      throw error;
    }
  }

  if (parsed.data.settings) {
    await db.appSettings.upsert({
      where: { id: 1 },
      update: {
        theme: mapThemeSetting(parsed.data.settings.theme),
        autosaveSeconds: parsed.data.settings.autosaveSeconds,
        enableRetryIncorrect: parsed.data.settings.enableRetryIncorrect,
        enableKeyboardShortcuts: parsed.data.settings.enableKeyboardShortcuts,
      },
      create: {
        id: 1,
        theme: mapThemeSetting(parsed.data.settings.theme),
        autosaveSeconds: parsed.data.settings.autosaveSeconds,
        enableRetryIncorrect: parsed.data.settings.enableRetryIncorrect,
        enableKeyboardShortcuts: parsed.data.settings.enableKeyboardShortcuts,
      },
    });
  }

  return ok({
    importedCount,
    skipped,
  });
}
