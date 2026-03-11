import type {
  EnumerationQuestion,
  MatchingQuestion,
  Question,
  UserAnswer,
} from "@/types/exam";

export interface QuestionGradeResult {
  questionId: string;
  isCorrect: boolean;
  score: number;
  maxScore: number;
}

const normalize = (value: string): string => value.trim().toLowerCase();

const toNormalizedArray = (value: string[]): string[] =>
  value.map((item) => normalize(item)).filter(Boolean);

const gradeMatching = (
  question: MatchingQuestion,
  userAnswer: UserAnswer | undefined,
): QuestionGradeResult => {
  const answerMap = (userAnswer as Record<string, string> | undefined) ?? {};
  const leftItems = question.options.left;
  const hits = leftItems.reduce((total, left) => {
    const expected = normalize(question.correctAnswer[left] ?? "");
    const actual = normalize(answerMap[left] ?? "");
    return total + (expected !== "" && expected === actual ? 1 : 0);
  }, 0);

  return {
    questionId: question.id,
    isCorrect: hits === leftItems.length,
    score: hits,
    maxScore: leftItems.length,
  };
};

const gradeEnumeration = (
  question: EnumerationQuestion,
  userAnswer: UserAnswer | undefined,
): QuestionGradeResult => {
  const correct = toNormalizedArray(question.correctAnswer);
  const provided = toNormalizedArray(
    Array.isArray(userAnswer) ? (userAnswer as string[]) : [],
  );

  let hits = 0;
  if (question.orderedAnswer) {
    hits = correct.reduce(
      (total, expected, index) =>
        total + (provided[index] === expected ? 1 : 0),
      0,
    );
  } else {
    const correctSet = new Set(correct);
    const uniqueProvided = Array.from(new Set(provided));
    hits = uniqueProvided.reduce(
      (total, item) => total + (correctSet.has(item) ? 1 : 0),
      0,
    );
  }

  return {
    questionId: question.id,
    isCorrect: hits === correct.length,
    score: hits,
    maxScore: correct.length,
  };
};

export const gradeQuestion = (
  question: Question,
  userAnswer: UserAnswer | undefined,
): QuestionGradeResult => {
  if (question.type === "matching") {
    return gradeMatching(question, userAnswer);
  }

  if (question.type === "enumeration") {
    return gradeEnumeration(question, userAnswer);
  }

  const expected = normalize(String(question.correctAnswer));
  const actual = normalize(typeof userAnswer === "string" ? userAnswer : "");
  const isCorrect = expected !== "" && expected === actual;

  return {
    questionId: question.id,
    isCorrect,
    score: isCorrect ? 1 : 0,
    maxScore: 1,
  };
};

export interface ExamGradeResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  perQuestion: Record<string, QuestionGradeResult>;
}

export const gradeExam = (
  questions: Question[],
  userAnswers: Record<string, UserAnswer>,
): ExamGradeResult => {
  const perQuestionList = questions.map((question) =>
    gradeQuestion(question, userAnswers[question.id]),
  );

  const totalScore = perQuestionList.reduce((acc, item) => acc + item.score, 0);
  const maxScore = perQuestionList.reduce(
    (acc, item) => acc + item.maxScore,
    0,
  );
  const percentage = maxScore === 0 ? 0 : (totalScore / maxScore) * 100;
  const perQuestion = Object.fromEntries(
    perQuestionList.map((item) => [item.questionId, item]),
  );

  return {
    totalScore,
    maxScore,
    percentage,
    perQuestion,
  };
};
