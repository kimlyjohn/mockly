import { z } from "zod";

import { examSchema } from "@/lib/schema";

export const importExamRequestSchema = z.object({
  exam: examSchema,
  filename: z.string().min(1).optional(),
  source: z.string().min(1).default("upload"),
  rawSize: z.number().int().positive().optional(),
});

export const startAttemptRequestSchema = z.object({
  mode: z.enum(["normal", "retry_incorrect"]).default("normal"),
  sourceAttemptId: z.string().min(1).optional(),
});

const answerValueSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.record(z.string(), z.string()),
]);

export const saveAttemptProgressSchema = z.object({
  currentQuestionIndex: z.number().int().min(0),
  elapsedSeconds: z.number().int().min(0),
  answers: z.record(z.string(), answerValueSchema),
  flaggedQuestionIds: z.array(z.string()).default([]),
});

export const updateSettingsSchema = z.object({
  theme: z.enum(["system", "light", "dark"]).optional(),
  autosaveSeconds: z.number().int().min(5).max(300).optional(),
  enableRetryIncorrect: z.boolean().optional(),
  enableKeyboardShortcuts: z.boolean().optional(),
});

export const backupImportSchema = z.object({
  exams: z.array(examSchema),
  settings: z
    .object({
      theme: z.enum(["system", "light", "dark"]),
      autosaveSeconds: z.number().int().min(5).max(300),
      enableRetryIncorrect: z.boolean(),
      enableKeyboardShortcuts: z.boolean(),
    })
    .optional(),
});

export type ImportExamRequest = z.output<typeof importExamRequestSchema>;
export type StartAttemptRequest = z.output<typeof startAttemptRequestSchema>;
export type SaveAttemptProgressRequest = z.output<
  typeof saveAttemptProgressSchema
>;
export type UpdateSettingsRequest = z.output<typeof updateSettingsSchema>;
export type BackupImportRequest = z.output<typeof backupImportSchema>;
