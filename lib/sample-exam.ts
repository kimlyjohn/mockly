import type { Exam } from "@/types/exam";

export const sampleExam: Exam = {
  title: "Mockly Demo Exam",
  description:
    "A full demo exam that includes all supported question types so you can test the whole experience.",
  metadata: {
    totalQuestions: 6,
    passingScore: 70,
    subject: "General Knowledge",
    shuffleQuestions: false,
    shuffleOptions: false,
  },
  questions: [
    {
      id: "q1",
      type: "true_false",
      prompt: "The Pacific Ocean is larger than the Atlantic Ocean.",
      correctAnswer: "true",
      explanation:
        "The Pacific Ocean is the largest and deepest ocean basin on Earth.",
    },
    {
      id: "q2",
      type: "multiple_choice",
      prompt: "Which HTML element is used for the largest heading by default?",
      options: ["<h1>", "<heading>", "<head>", "<title>"],
      correctAnswer: "<h1>",
      explanation:
        "<h1> is the top-level heading element and is rendered as the largest heading by default.",
    },
    {
      id: "q3",
      type: "identification",
      hasChoices: false,
      prompt: "Identify the process by which plants make food using sunlight.",
      correctAnswer: "photosynthesis",
      explanation:
        "Plants convert light energy to chemical energy through photosynthesis.",
    },
    {
      id: "q4",
      type: "identification",
      hasChoices: true,
      prompt: "Select the capital city of Japan.",
      options: ["Osaka", "Kyoto", "Tokyo", "Nagoya"],
      correctAnswer: "Tokyo",
      explanation: "Tokyo is the capital and most populous city of Japan.",
    },
    {
      id: "q5",
      type: "matching",
      prompt: "Match each country to its capital.",
      options: {
        left: ["France", "Spain", "Italy"],
        right: ["Madrid", "Rome", "Paris"],
      },
      correctAnswer: {
        France: "Paris",
        Spain: "Madrid",
        Italy: "Rome",
      },
      explanation:
        "France->Paris, Spain->Madrid, and Italy->Rome are standard country-capital pairs.",
    },
    {
      id: "q6",
      type: "enumeration",
      prompt: "Enumerate three primary colors in traditional color theory.",
      correctAnswer: ["red", "blue", "yellow"],
      orderedAnswer: false,
      explanation:
        "The traditional primary colors are red, blue, and yellow; order is not important here.",
    },
  ],
};
