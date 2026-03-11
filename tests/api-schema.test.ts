import { describe, expect, it } from "vitest";

import {
  backupImportSchema,
  saveAttemptProgressSchema,
  updateSettingsSchema,
} from "../lib/api-schema";

describe("api schema", () => {
  it("parses attempt progress payload", () => {
    const parsed = saveAttemptProgressSchema.parse({
      currentQuestionIndex: 2,
      elapsedSeconds: 42,
      answers: {
        q1: "true",
        q2: ["a", "b"],
      },
      flaggedQuestionIds: ["q3"],
    });

    expect(parsed.currentQuestionIndex).toBe(2);
    expect(parsed.flaggedQuestionIds).toEqual(["q3"]);
  });

  it("validates settings bounds", () => {
    const result = updateSettingsSchema.safeParse({
      autosaveSeconds: 3,
    });

    expect(result.success).toBe(false);
  });

  it("validates backup payload shape", () => {
    const result = backupImportSchema.safeParse({
      exams: [],
    });

    expect(result.success).toBe(true);
  });
});
