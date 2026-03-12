interface MatchingOptionItem {
  id: string;
  text: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isMatchingOptionItem = (value: unknown): value is MatchingOptionItem =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.text === "string";

const normalizeMatchingQuestion = (
  question: Record<string, unknown>,
): Record<string, unknown> => {
  const options = isRecord(question.options)
    ? question.options
    : {
        left: question.leftItems,
        right: question.rightItems,
      };
  const correctAnswer = question.correctAnswer;

  if (!isRecord(options) || !isRecord(correctAnswer)) {
    return question;
  }

  const left = options.left;
  const right = options.right;
  if (!Array.isArray(left) || !Array.isArray(right)) {
    return question;
  }

  const isObjectStyle =
    left.every(isMatchingOptionItem) && right.every(isMatchingOptionItem);
  const isStringStyle =
    left.every((item) => typeof item === "string") &&
    right.every((item) => typeof item === "string");

  if (!isObjectStyle && !isStringStyle) {
    return question;
  }

  if (isStringStyle) {
    return {
      ...question,
      options: {
        left,
        right,
      },
    };
  }

  const leftItems = left as MatchingOptionItem[];
  const rightItems = right as MatchingOptionItem[];
  const leftById = new Map(leftItems.map((item) => [item.id, item.text]));
  const rightById = new Map(rightItems.map((item) => [item.id, item.text]));

  const normalizedCorrect = Object.fromEntries(
    Object.entries(correctAnswer).map(([leftId, rightId]) => {
      if (typeof rightId !== "string") {
        return [leftId, String(rightId)];
      }
      return [
        leftById.get(leftId) ?? leftId,
        rightById.get(rightId) ?? rightId,
      ];
    }),
  );

  return {
    ...question,
    options: {
      left: leftItems.map((item) => item.text),
      right: rightItems.map((item) => item.text),
    },
    correctAnswer: normalizedCorrect,
  };
};

const letterToIndex = (value: string): number | null => {
  const normalized = value.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  if (/^[A-Z]$/.test(normalized)) {
    return normalized.charCodeAt(0) - 65;
  }

  const maybePrefixed = normalized.match(/^OPTION\s+([A-Z])$/);
  if (maybePrefixed) {
    return maybePrefixed[1].charCodeAt(0) - 65;
  }

  return null;
};

const normalizeQuestion = (rawQuestion: unknown): unknown => {
  if (!isRecord(rawQuestion)) {
    return rawQuestion;
  }

  const type = rawQuestion.type;
  if (
    type !== "true_false" &&
    type !== "multiple_choice" &&
    type !== "identification" &&
    type !== "matching"
  ) {
    return rawQuestion;
  }

  const question = { ...rawQuestion };

  if (type === "true_false" && typeof question.correctAnswer === "boolean") {
    question.correctAnswer = question.correctAnswer ? "true" : "false";
  }

  if (type === "multiple_choice" && Array.isArray(question.options)) {
    const options = question.options.filter(
      (value): value is string => typeof value === "string",
    );

    if (typeof question.correctAnswer === "number") {
      const fromIndex = options[question.correctAnswer];
      if (fromIndex) {
        question.correctAnswer = fromIndex;
      }
    }

    if (typeof question.correctAnswer === "string") {
      const answerIndex = letterToIndex(question.correctAnswer);
      if (answerIndex !== null && options[answerIndex]) {
        question.correctAnswer = options[answerIndex];
      }
    }
  }

  if (type === "identification" && question.hasChoices === undefined) {
    question.hasChoices =
      Array.isArray(question.options) && question.options.length > 0;
  }

  if (type === "matching") {
    return normalizeMatchingQuestion(question);
  }

  return question;
};

export const unwrapExamPayload = (raw: unknown): unknown => {
  if (!isRecord(raw)) {
    return raw;
  }

  if (isRecord(raw.exam)) {
    return raw.exam;
  }

  if (isRecord(raw.data)) {
    return raw.data;
  }

  if (Array.isArray(raw.exams) && raw.exams.length === 1) {
    return raw.exams[0];
  }

  return raw;
};

export const normalizeExamInput = (raw: unknown): unknown => {
  if (!isRecord(raw) || !Array.isArray(raw.questions)) {
    return raw;
  }

  const normalizedQuestions = raw.questions.map(normalizeQuestion);

  const normalizedMetadata = isRecord(raw.metadata)
    ? {
        ...raw.metadata,
        totalQuestions: normalizedQuestions.length,
      }
    : raw.metadata;

  return {
    ...raw,
    metadata: normalizedMetadata,
    questions: normalizedQuestions,
  };
};

const extractJsonCandidate = (input: string): string => {
  const trimmed = input.trim();

  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  return trimmed;
};

export const parsePossiblyWrappedJson = (text: string): unknown => {
  const directCandidate = extractJsonCandidate(text);
  try {
    return JSON.parse(directCandidate) as unknown;
  } catch {
    // Continue to object/array extraction fallbacks.
  }

  const raw = text.trim();

  const firstObj = raw.indexOf("{");
  const lastObj = raw.lastIndexOf("}");
  if (firstObj >= 0 && lastObj > firstObj) {
    const objectSlice = raw.slice(firstObj, lastObj + 1);
    try {
      return JSON.parse(objectSlice) as unknown;
    } catch {
      // Ignore and try array fallback.
    }
  }

  const firstArr = raw.indexOf("[");
  const lastArr = raw.lastIndexOf("]");
  if (firstArr >= 0 && lastArr > firstArr) {
    const arraySlice = raw.slice(firstArr, lastArr + 1);
    return JSON.parse(arraySlice) as unknown;
  }

  return JSON.parse(raw) as unknown;
};
