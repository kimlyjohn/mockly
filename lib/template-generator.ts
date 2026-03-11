import type { Exam, Question } from "@/types/exam";

export type TemplateTypeSelection =
  | "true_false"
  | "multiple_choice"
  | "identification_no_choices"
  | "identification_with_choices"
  | "matching"
  | "enumeration";

export interface TemplateMetaInput {
  title: string;
  description: string;
  passingScore: number;
  subject?: string;
}

export interface TemplateGenerationStrategy {
  aiDecidesQuestionTypesAndCounts?: boolean;
}

export type TemplateTypeMinimums = Partial<
  Record<TemplateTypeSelection, number>
>;

interface TemplateQuestionHint {
  questionId: string;
  type: Question["type"];
  objective: string;
  difficulty: "easy" | "medium" | "hard";
  constraints: string[];
}

interface GeneratorContext {
  version: "1.0";
  purpose: string;
  authoringChecklist: string[];
  normalizationRules: string[];
  aiGenerationBrief: string[];
  selectedTypePreferences: TemplateTypeSelection[];
  questionHints: TemplateQuestionHint[];
}

export type TemplateExamOutput = Exam & {
  generatorContext: GeneratorContext;
};

const buildQuestion = (type: TemplateTypeSelection, id: string): Question => {
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

export const generateTemplateExam = (
  selectedTypes: TemplateTypeSelection[],
  meta: TemplateMetaInput,
  strategy?: TemplateGenerationStrategy,
): TemplateExamOutput => {
  const aiDecides = strategy?.aiDecidesQuestionTypesAndCounts ?? true;
  const effectiveTypes =
    selectedTypes.length > 0 ? selectedTypes : TYPES_FOR_FALLBACK;
  const questions: Question[] = [];

  effectiveTypes.forEach((type, index) => {
    const id = `${type}_${index + 1}`;
    questions.push(buildQuestion(type, id));
  });

  const questionHints: TemplateQuestionHint[] = questions.map((question) => ({
    questionId: question.id,
    type: question.type,
    objective: `Assess ${question.type.replaceAll("_", " ")} understanding`,
    difficulty: "medium",
    constraints:
      question.type === "multiple_choice"
        ? [
            "At least 4 options when possible.",
            "Only one clearly correct option.",
          ]
        : question.type === "matching"
          ? [
              "Left/right options should be one-to-one.",
              "Avoid ambiguous pairings.",
            ]
          : question.type === "enumeration"
            ? [
                "Set exact expected item count.",
                "Specify whether order matters.",
              ]
            : ["Use unambiguous wording.", "Provide concise explanation."],
  }));

  return {
    title: meta.title.trim() || "Mockly Template Exam",
    description: meta.description.trim() || "TODO: Describe this exam.",
    metadata: {
      totalQuestions: questions.length,
      passingScore: Math.max(0, Math.min(100, meta.passingScore)),
      subject: meta.subject?.trim() || "General",
      shuffleQuestions: false,
      shuffleOptions: false,
    },
    questions,
    generatorContext: {
      version: "1.0",
      purpose:
        "Fill TODO placeholders to generate a production-ready Mockly exam JSON.",
      authoringChecklist: [
        "Replace all TODO placeholders.",
        "Ensure each correctAnswer matches options when choices exist.",
        "Keep question IDs stable and unique.",
        "Set metadata.totalQuestions equal to questions.length.",
      ],
      normalizationRules: [
        "String comparisons are case-insensitive during grading.",
        "Trim leading/trailing spaces for answer evaluation.",
        "Enumeration can be ordered or unordered via orderedAnswer.",
      ],
      aiGenerationBrief: aiDecides
        ? [
            "AI should decide the final mix of question types and total question count.",
            "AI may add/remove/rewrite questions as needed for the target difficulty.",
            "Selected types are preferences, not hard constraints.",
          ]
        : [
            "Keep one starter question per selected type.",
            "Expand question count manually after replacing TODO placeholders.",
            "Selected types should be treated as hard constraints.",
          ],
      selectedTypePreferences: selectedTypes,
      questionHints,
    },
  };
};

export const stringifyTemplateExam = (exam: TemplateExamOutput): string =>
  `${JSON.stringify(exam, null, 2)}\n`;

const formatTypeForDisplay = (type: TemplateTypeSelection): string => {
  if (type === "identification_no_choices")
    return "identification (without choices)";
  if (type === "identification_with_choices")
    return "identification (with choices)";
  return type;
};

export const buildAiExamPrompt = (
  exam: TemplateExamOutput,
  options?: {
    requireSources?: boolean;
    allowNonJsonInput?: boolean;
    topicContext?: string;
    minQuestionCountPerType?: TemplateTypeMinimums;
    aiDecides?: boolean;
  },
): string => {
  const requireSources = options?.requireSources ?? true;
  const allowNonJsonInput = options?.allowNonJsonInput ?? true;
  const topicContext = options?.topicContext?.trim();
  const minQuestionCountPerType = options?.minQuestionCountPerType ?? {};
  const aiDecides = options?.aiDecides ?? false;
  const minTypeLines = Object.entries(minQuestionCountPerType)
    .filter((entry): entry is [TemplateTypeSelection, number] => {
      const [, count] = entry;
      return Number.isFinite(count) && count > 0;
    })
    .map(([type, count]) => `- include at least ${count} ${type} question(s)`);

  const selectedPrefs = exam.generatorContext.selectedTypePreferences;

  // When AI decides freely, it can produce any question type so all validation
  // rules apply. When strict, only rules relevant to selected types are needed.
  const hasType = (...types: TemplateTypeSelection[]) =>
    aiDecides ? true : types.some((t) => selectedPrefs.includes(t));

  const typeLines = aiDecides
    ? [
        "All supported types may be used: true_false, multiple_choice, identification, matching, enumeration.",
        `Preferred types (if topic allows): ${selectedPrefs.map(formatTypeForDisplay).join(", ") || "any"}.`,
      ]
    : selectedPrefs.map((t) => `- ${formatTypeForDisplay(t)}`);

  const validationRules: string[] = [];
  if (
    hasType(
      "multiple_choice",
      "identification_with_choices",
      "identification_no_choices",
    )
  ) {
    validationRules.push(
      "- multiple_choice and/or identification(hasChoices=true): correctAnswer must exactly match one option value.",
    );
  }
  if (hasType("matching")) {
    validationRules.push(
      "- matching: options.left and options.right must be plain string arrays; correctAnswer maps each left string to a right string.",
    );
  }
  if (hasType("enumeration")) {
    validationRules.push(
      "- enumeration: correctAnswer must be string[]; orderedAnswer may be true or false.",
    );
  }
  validationRules.push(
    "- Explanations should be concise, factual, and directly tied to why the answer is correct.",
  );

  const typeSectionHeader = aiDecides
    ? "QUESTION TYPES (AI (YOU) DECIDES MIX AND COUNT)"
    : "QUESTION TYPES TO USE (STRICT — DO NOT ADD OTHERS)";

  return [
    "ROLE",
    "You are an expert exam author generating production-ready exam JSON for the Mockly platform.",
    "",
    "PRIMARY OBJECTIVE",
    "Produce exactly one valid JSON object (no markdown, no code fences, no prose).",
    "",
    "OUTPUT CONTRACT (MUST FOLLOW)",
    "1. Output must be strict JSON only.",
    "2. Top-level fields required: title, description, metadata, questions.",
    "3. metadata must include: totalQuestions, passingScore, subject, shuffleQuestions, shuffleOptions.",
    "4. metadata.totalQuestions MUST equal questions.length.",
    "5. All question ids must be unique and stable.",
    "",
    typeSectionHeader,
    ...typeLines,
    "",
    "VALIDATION RULES (HARD REQUIREMENTS)",
    ...validationRules,
    ...(minTypeLines.length > 0
      ? ["", "MINIMUM QUESTION COUNT CONSTRAINTS BY TYPE", ...minTypeLines]
      : []),
    "",
    "SOURCE POLICY",
    requireSources
      ? "Include credible references by appending a compact 'Sources: ...' section inside description."
      : "Do not include source references.",
    "",
    "INPUT HANDLING",
    allowNonJsonInput
      ? "If user input is plain text/topic notes (not JSON), infer requirements and still produce a complete valid JSON exam."
      : "If user input is incomplete, still produce the best valid JSON exam possible.",
    ...(topicContext ? ["", "TOPIC CONTEXT", topicContext] : []),
    "",
    "QUESTION AUTHORING GUIDELINES",
    "- Be generous with the number of questions: cover the topic thoroughly across all selected types.",
    "- Prioritize questions that are likely to appear in a real exam — key concepts, definitions, cause-and-effect, application, and commonly tested facts.",
    "- Avoid trivia that has little practical value even if it appears in the source (e.g. exact birth dates, obscure names with no conceptual significance, minor footnotes).",
    "- Every question should test knowledge worth knowing.",
    "",
    "QUALITY CHECKLIST BEFORE FINAL OUTPUT",
    "- No TODO placeholders remain.",
    "- No schema violations.",
    "- No duplicate question ids.",
    "- totalQuestions is accurate.",
    "- Output is JSON only (no additional text).",
    "",
    "STARTER TEMPLATE (REPLACE/EXPAND AS NEEDED)",
    stringifyTemplateExam(exam).trimEnd(),
  ].join("\n");
};

const TYPES_FOR_FALLBACK: TemplateTypeSelection[] = [
  "true_false",
  "multiple_choice",
  "identification_no_choices",
  "identification_with_choices",
  "matching",
  "enumeration",
];
