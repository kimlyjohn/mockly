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

// ─────────────────────────────────────────────────────────────
// EXAM REALISM DISTRIBUTION TABLE
// Describes how a real academic exam should distribute question
// types. Used to inject realistic structure guidance into the
// AI prompt so it doesn't pick arbitrary question counts.
// ─────────────────────────────────────────────────────────────
const EXAM_REALISM_DISTRIBUTION: Record<
  TemplateTypeSelection,
  { role: string; typicalCount: string; notes: string }
> = {
  true_false: {
    role: "Bulk recall layer — tests definitions, distinctions, and common misconceptions.",
    typicalCount: "20–30 items",
    notes:
      "This is the highest-volume type. Cover every major definition, key term, and common trap from the source. Each item should test ONE fact. Mix genuinely true statements with false ones where a single word is swapped (e.g. a wrong number, a wrong doctrine name, or a definition applied to the wrong concept).",
  },
  multiple_choice: {
    role: "Conceptual understanding — tests application, cause-effect, and reasoning.",
    typicalCount: "5–10 items",
    notes:
      "Use for questions that require choosing between closely related concepts. Each question must have exactly 4 options. Only one option is clearly correct; the distractors must be plausible but wrong. Avoid trick questions — distractors should represent common misconceptions, not wordplay.",
  },
  identification_no_choices: {
    role: "Recall and precision — tests ability to name the exact term, person, law, case, or concept.",
    typicalCount: "10–20 items",
    notes:
      "Write clues that are descriptive but unambiguous — the clue should point to exactly one correct answer. Cover key terms, landmark cases, important laws, named principles, and significant people from the source material.",
  },
  identification_with_choices: {
    role: "Guided recall — same as identification but with a limited answer bank to reduce guessing.",
    typicalCount: "5–10 items",
    notes:
      "Use when the answer space is bounded (e.g. 'which of these 4 people is the founding father?'). Provide 3–5 choices. The correct answer must exactly match one option value.",
  },
  matching: {
    role: "Relationship mapping — tests whether students can correctly pair related concepts.",
    typicalCount: "2–3 matching sets of 8–10 pairs each",
    notes:
      "Group pairs thematically into named sets (e.g. Set A: Doctrines, Set B: Maritime Zones). Each set should have 8–10 left-right pairs. Do NOT create one giant matching question — split by topic. Left items should be descriptions/clues; right items should be the short answer terms.",
  },
  enumeration: {
    role: "List mastery — tests whether students can recall complete numbered lists.",
    typicalCount: "4–8 enumeration groups",
    notes:
      "Each enumeration group covers one complete list from the source (e.g. '5 steps in treaty-making', '4 elements of a state', '8 non-derogable rights'). Only create an enumeration question for lists that appear explicitly in the source material. Set orderedAnswer: true only when sequence matters.",
  },
};

// ─────────────────────────────────────────────────────────────
// SOURCE ANALYSIS INSTRUCTIONS
// Tells the AI HOW to read the source before writing questions.
// ─────────────────────────────────────────────────────────────
const SOURCE_ANALYSIS_INSTRUCTIONS = [
  "Before writing any questions, analyze the source material for the following testable elements:",
  "  1. KEY DEFINITIONS — every term that is explicitly defined in the source. These become true/false and identification questions.",
  "  2. NUMBERED LISTS — every list with a fixed count (e.g. '5 elements', '3 principles', '4 steps'). Each complete list becomes one enumeration question.",
  "  3. NAMED DOCTRINES / PRINCIPLES / THEORIES — every named concept becomes a potential identification or matching item.",
  "  4. PEOPLE, DATES, LAWS, CASES — landmark facts that professors commonly test. These become identification or true/false items.",
  "  5. COMMON CONFUSIONS — pairs of concepts that students commonly confuse (e.g. two doctrines with similar names, two zones with similar distances). These become true/false traps.",
  "  6. CAUSE-AND-EFFECT RELATIONSHIPS — use these for multiple_choice questions that test conceptual understanding.",
  "After identifying all testable elements, THEN decide the question type and count for each element.",
];

// ─────────────────────────────────────────────────────────────
// TRUE/FALSE TRAP PATTERNS
// Tells the AI exactly how to write realistic T/F questions
// the way professors actually write them.
// ─────────────────────────────────────────────────────────────
const TRUE_FALSE_TRAP_PATTERNS = [
  "When writing FALSE true/false statements, use EXACTLY ONE of these professor-style traps per question:",
  "  TRAP 1 — WORD SWAP: Replace one key word with a wrong but similar-sounding word (e.g. 'Transportation' instead of 'Transformation').",
  "  TRAP 2 — NUMBER SWAP: Replace a specific number with a wrong number (e.g. '24 nautical miles' instead of '12 nautical miles' for the territorial sea).",
  "  TRAP 3 — DEFINITION INVERSION: Apply the correct definition of Concept A to Concept B (e.g. write the definition of international law but label it as national law).",
  "  TRAP 4 — LIST CONTAMINATION: Include one wrong item in an otherwise correct list (e.g. list 4 correct founding members but add one non-member like Vietnam instead of the correct fifth).",
  "  TRAP 5 — ATTRIBUTE SWAP: Swap a specific attribute between two related concepts (e.g. swap which doctrine covers 'revolution' vs. 'military coup').",
  "  TRAP 6 — NEAR-MISS BODY/LAW: Reference a real concept but assign it to the wrong legal instrument (e.g. attribute a principle to the wrong Declaration or Convention).",
  "Do NOT write FALSE statements that are obviously wrong. The statement must look credible at first glance.",
];

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

  const hasType = (...types: TemplateTypeSelection[]) =>
    aiDecides ? true : types.some((t) => selectedPrefs.includes(t));

  // ── Build type lines with realism guidance ──────────────────
  const typeLines: string[] = aiDecides
    ? [
        "All supported types may be used: true_false, multiple_choice, identification, matching, enumeration.",
        `Preferred types (if topic allows): ${selectedPrefs.map(formatTypeForDisplay).join(", ") || "any"}.`,
      ]
    : selectedPrefs.map((t) => `- ${formatTypeForDisplay(t)}`);

  // ── Build realism table for selected types ──────────────────
  const effectiveTypes: TemplateTypeSelection[] = aiDecides
    ? (Object.keys(EXAM_REALISM_DISTRIBUTION) as TemplateTypeSelection[])
    : selectedPrefs;

  const realismTableLines: string[] = [
    "The following table defines the REALISTIC ROLE and EXPECTED COUNT of each question type in a real academic exam.",
    "Study this table before deciding how many questions to write per type.",
    "",
    ...effectiveTypes.flatMap((type) => {
      const entry = EXAM_REALISM_DISTRIBUTION[type];
      return [
        `  [${formatTypeForDisplay(type).toUpperCase()}]`,
        `  Role: ${entry.role}`,
        `  Typical count: ${entry.typicalCount}`,
        `  Authoring notes: ${entry.notes}`,
        "",
      ];
    }),
  ];

  // ── Validation rules ────────────────────────────────────────
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

  // ── Assemble final prompt ───────────────────────────────────
  return [
    "ROLE",
    "You are an expert exam author generating production-ready exam JSON for the Mockly platform.",
    "Your exams are used as MOCK EXAMS for real academic subjects — they must mirror the structure, depth, and item counts of an actual professor-written exam, not a casual quiz.",
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
    "SOURCE ANALYSIS (DO THIS BEFORE WRITING ANY QUESTIONS)",
    ...SOURCE_ANALYSIS_INSTRUCTIONS,
    "",
    typeSectionHeader,
    ...typeLines,
    "",
    "EXAM REALISM GUIDELINES (READ CAREFULLY — THIS DETERMINES QUESTION COUNT)",
    "This is a MOCK EXAM, not a quiz. Question counts must reflect a real academic exam structure.",
    "Do NOT pick arbitrary or symmetric question counts (e.g. 5 of each type). Instead, follow the realistic distribution below.",
    ...realismTableLines,
    "EXAM STRUCTURE TARGET:",
    "  - Total question count should reflect the breadth of the source material.",
    "  - A typical unit exam from a real course has 40–60+ total items.",
    "  - True/false should be the largest section (bulk of items).",
    "  - Enumeration questions should cover EVERY complete numbered list in the source.",
    "  - Matching questions should be grouped into thematic sets — NOT one giant question.",
    "  - Identification should cover every key named concept, person, case, and law.",
    "",
    "TRUE/FALSE AUTHORING RULES (CRITICAL — READ BEFORE WRITING T/F QUESTIONS)",
    ...TRUE_FALSE_TRAP_PATTERNS,
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
    "If the user provides document uploads (PDF, slides, notes), treat them as the PRIMARY source material and extract all testable content from them before writing questions.",
    ...(topicContext ? ["", "TOPIC CONTEXT", topicContext] : []),
    "",
    "QUESTION AUTHORING GUIDELINES",
    "- Cover the source material THOROUGHLY — every major concept, definition, list, and named element should appear in at least one question.",
    "- Prioritize questions that are likely to appear in a real exam — key concepts, definitions, cause-and-effect, named doctrines/principles, and complete enumerable lists.",
    "- Every FALSE true/false statement must use exactly one of the trap patterns listed above — not generic falsehoods.",
    "- Every identification question must point to exactly one unambiguous correct answer.",
    "- Avoid trivia with no practical exam value (e.g. exact birth dates, obscure footnotes, names with no conceptual significance).",
    "- Every question should test knowledge worth knowing and worth points on a real exam.",
    "",
    "QUALITY CHECKLIST BEFORE FINAL OUTPUT",
    "- No TODO placeholders remain.",
    "- No schema violations.",
    "- No duplicate question ids.",
    "- totalQuestions is accurate.",
    "- True/false section has at least 20 items covering definitions, key terms, and traps.",
    "- Every complete numbered list from the source has a corresponding enumeration question.",
    "- Matching questions are split into thematic sets of 8–10 pairs each.",
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
