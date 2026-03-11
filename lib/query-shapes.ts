export const examInclude = {
  questions: {
    include: {
      options: true,
      matchingPairs: true,
      enumerationRows: true,
    },
  },
} as const;

export const attemptInclude = {
  answers: {
    include: {
      entries: true,
    },
  },
  flags: true,
} as const;
