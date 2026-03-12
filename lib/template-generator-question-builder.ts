import type { Question } from "@/types/exam";
import type { TemplateTypeSelection } from "@/lib/template-generator";

export const buildTemplateQuestion = (
  type: TemplateTypeSelection,
  id: string,
): Question => {
  if (type === "true_false") {
    return {
      id,
      type: "true_false",
      prompt: "TODO: Write a true or false statement.",
      correctAnswer: "true",
      explanation: "TODO: Explain why this is true or false.",
    };
  }

  if (type === "multiple_choice") {
    return {
      id,
      type: "multiple_choice",
      prompt: "TODO: Write your multiple choice question.",
      options: [
        "TODO: Option A",
        "TODO: Option B",
        "TODO: Option C",
        "TODO: Option D",
      ],
      correctAnswer: "TODO: Option A",
      explanation: "TODO: Explain why the correct option is correct.",
    };
  }

  if (type === "identification_no_choices") {
    return {
      id,
      type: "identification",
      hasChoices: false,
      prompt: "TODO: Write your identification question.",
      correctAnswer: "TODO: Correct identification answer",
      explanation: "TODO: Explain the answer.",
    };
  }

  if (type === "identification_with_choices") {
    return {
      id,
      type: "identification",
      hasChoices: true,
      prompt: "TODO: Write your identification question with choices.",
      options: ["TODO: Choice 1", "TODO: Choice 2", "TODO: Choice 3"],
      correctAnswer: "TODO: Choice 1",
      explanation: "TODO: Explain why this choice is correct.",
    };
  }

  if (type === "matching") {
    return {
      id,
      type: "matching",
      prompt: "TODO: Match each left item to its correct right item.",
      options: {
        left: ["TODO: Left item 1", "TODO: Left item 2", "TODO: Left item 3"],
        right: [
          "TODO: Right item 1",
          "TODO: Right item 2",
          "TODO: Right item 3",
        ],
      },
      correctAnswer: {
        "TODO: Left item 1": "TODO: Right item 1",
        "TODO: Left item 2": "TODO: Right item 2",
        "TODO: Left item 3": "TODO: Right item 3",
      },
      explanation: "TODO: Explain the matching pairs.",
    };
  }

  return {
    id,
    type: "enumeration",
    prompt: "TODO: Ask the learner to enumerate N items.",
    correctAnswer: [
      "TODO: Correct item 1",
      "TODO: Correct item 2",
      "TODO: Correct item 3",
    ],
    orderedAnswer: false,
    explanation: "TODO: Explain all expected items.",
  };
};
