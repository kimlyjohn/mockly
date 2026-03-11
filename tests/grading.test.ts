import { describe, expect, it } from "vitest";

import { gradeExam, gradeQuestion } from "../lib/grading";
import type { Question } from "../types/exam";

describe("grading", () => {
  it("grades multiple choice correctly", () => {
    const question: Question = {
      id: "q1",
      type: "multiple_choice",
      prompt: "Q",
      explanation: "E",
      options: ["A", "B", "C"],
      correctAnswer: "B",
    };

    const result = gradeQuestion(question, "b");
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(1);
  });

  it("grades unordered enumeration partially", () => {
    const question: Question = {
      id: "q2",
      type: "enumeration",
      prompt: "Q",
      explanation: "E",
      correctAnswer: ["red", "green", "blue"],
      orderedAnswer: false,
    };

    const result = gradeQuestion(question, ["green", "blue", "wrong"]);
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(2);
    expect(result.maxScore).toBe(3);
  });

  it("computes aggregate exam percentage", () => {
    const questions: Question[] = [
      {
        id: "q1",
        type: "true_false",
        prompt: "Q1",
        explanation: "E1",
        correctAnswer: "true",
      },
      {
        id: "q2",
        type: "identification",
        hasChoices: false,
        prompt: "Q2",
        explanation: "E2",
        correctAnswer: "tokyo",
      },
    ];

    const result = gradeExam(questions, {
      q1: "true",
      q2: "wrong",
    });

    expect(result.totalScore).toBe(1);
    expect(result.maxScore).toBe(2);
    expect(result.percentage).toBe(50);
  });
});
