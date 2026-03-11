import { describe, expect, it } from "vitest";

import { examSchema } from "../lib/schema";

describe("exam schema", () => {
  it("accepts a valid exam", () => {
    const parsed = examSchema.parse({
      title: "Sample",
      description: "Desc",
      metadata: {
        totalQuestions: 1,
        passingScore: 70,
      },
      questions: [
        {
          id: "q1",
          type: "true_false",
          prompt: "Sky is blue",
          explanation: "Because scattering.",
          correctAnswer: "true",
        },
      ],
    });

    expect(parsed.title).toBe("Sample");
    expect(parsed.questions).toHaveLength(1);
  });

  it("rejects totalQuestions mismatch", () => {
    const result = examSchema.safeParse({
      title: "Sample",
      description: "Desc",
      metadata: {
        totalQuestions: 2,
        passingScore: 70,
      },
      questions: [
        {
          id: "q1",
          type: "true_false",
          prompt: "Sky is blue",
          explanation: "Because scattering.",
          correctAnswer: "true",
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
