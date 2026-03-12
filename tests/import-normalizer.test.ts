import { describe, expect, it } from "vitest";

import { normalizeExamInput } from "@/lib/import-normalizer";
import { examSchema } from "@/lib/schema";

describe("import normalizer", () => {
  it("normalizes true_false booleans and identification hasChoices", () => {
    const raw = {
      title: "OS",
      description: "desc",
      metadata: { totalQuestions: 2, passingScore: 70 },
      questions: [
        {
          id: "tf_1",
          type: "true_false",
          prompt: "p",
          correctAnswer: true,
          explanation: "e",
        },
        {
          id: "id_1",
          type: "identification",
          prompt: "p",
          correctAnswer: "Kernel",
          explanation: "e",
        },
      ],
    };

    const normalized = normalizeExamInput(raw);
    const parsed = examSchema.parse(normalized);
    const tfQuestion = parsed.questions[0];
    const idQuestion = parsed.questions[1];

    expect(tfQuestion.type).toBe("true_false");
    if (tfQuestion.type !== "true_false") {
      throw new Error("Expected true_false question");
    }
    expect(tfQuestion.correctAnswer).toBe("true");

    expect(idQuestion.type).toBe("identification");
    if (idQuestion.type !== "identification") {
      throw new Error("Expected identification question");
    }
    expect(idQuestion.hasChoices).toBe(false);
  });

  it("normalizes matching leftItems/rightItems into options.left/right", () => {
    const raw = {
      title: "OS",
      description: "desc",
      metadata: { totalQuestions: 1, passingScore: 70 },
      questions: [
        {
          id: "match_1",
          type: "matching",
          prompt: "Match",
          leftItems: ["A", "B"],
          rightItems: ["1", "2"],
          correctAnswer: { A: "1", B: "2" },
          explanation: "e",
        },
      ],
    };

    const normalized = normalizeExamInput(raw);
    const parsed = examSchema.parse(normalized);
    const matchingQuestion = parsed.questions[0];

    expect(matchingQuestion.type).toBe("matching");
    if (matchingQuestion.type !== "matching") {
      throw new Error("Expected matching question");
    }
    expect(matchingQuestion.options.left).toEqual(["A", "B"]);
    expect(matchingQuestion.options.right).toEqual(["1", "2"]);
  });
});
