import type { Exam, Question } from "@/types/exam";
import { buildTemplateQuestion } from "@/lib/template-generator-question-builder";
import {
  EXAM_REALISM_DISTRIBUTION,
  SOURCE_ANALYSIS_INSTRUCTIONS,
  TRUE_FALSE_TRAP_PATTERNS,
  TYPES_FOR_FALLBACK,
  formatTypeForDisplay,
} from "@/lib/template-generator-content";

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

export const generateTemplateExam = (
  selectedTypes: TemplateTypeSelection[],
  meta: TemplateMetaInput,
  strategy?: TemplateGenerationStrategy,
): TemplateExamOutput => {
  const aiDecides = strategy?.aiDecidesQuestionTypesAndCounts ?? true;
  const effectiveTypes =
    selectedTypes.length > 0 ? selectedTypes : FALLBACK_TYPES;
  const questions: Question[] = [];

  effectiveTypes.forEach((type, index) => {
    const id = `${type}_${index + 1}`;
    questions.push(buildTemplateQuestion(type, id));
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

export const buildAiExamPrompt = (
  exam: TemplateExamOutput,
  options?: {
    requireSources?: boolean;
    allowNonJsonInput?: boolean;
    topicContext?: string;
    minQuestionCountPerType?: TemplateTypeMinimums;
    aiDecides?: boolean;
    aiDecidesTypes?: boolean;
    aiDecidesCounts?: boolean;
  },
): string => {
  const requireSources = options?.requireSources ?? true;
  const allowNonJsonInput = options?.allowNonJsonInput ?? true;
  const topicContext = options?.topicContext?.trim();
  const minQuestionCountPerType = options?.minQuestionCountPerType ?? {};
  const aiDecidesTypes = options?.aiDecidesTypes ?? options?.aiDecides ?? false;
  const aiDecidesCounts =
    options?.aiDecidesCounts ?? options?.aiDecides ?? false;

  const minTypeLines = Object.entries(minQuestionCountPerType)
    .filter((entry): entry is [TemplateTypeSelection, number] => {
      const [, count] = entry;
      return Number.isFinite(count) && count > 0;
    })
    .map(([type, count]) => `- include at least ${count} ${type} question(s)`);

  const selectedPrefs = exam.generatorContext.selectedTypePreferences;

  const hasType = (...types: TemplateTypeSelection[]) =>
    aiDecidesTypes ? true : types.some((t) => selectedPrefs.includes(t));

  // ── Build type lines with realism guidance ──────────────────
  const typeLines: string[] = aiDecidesTypes
    ? [
        "All supported types may be used: true_false, multiple_choice, identification, matching, enumeration.",
        `Preferred types (if topic allows): ${selectedPrefs.map(formatTypeForDisplay).join(", ") || "any"}.`,
      ]
    : selectedPrefs.map((t) => `- ${formatTypeForDisplay(t)}`);

  // ── Build realism table for selected types ──────────────────
  const effectiveTypes: TemplateTypeSelection[] = aiDecidesTypes
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

  const typeSectionHeader = aiDecidesTypes
    ? aiDecidesCounts
      ? "QUESTION TYPES (AI DECIDES MIX AND COUNT)"
      : "QUESTION TYPES (AI DECIDES TYPES, COUNTS MUST FOLLOW YOUR CONSTRAINTS)"
    : aiDecidesCounts
      ? "QUESTION TYPES TO USE (FIXED TYPES, AI MAY ADJUST COUNTS)"
      : "QUESTION TYPES TO USE (STRICT — DO NOT ADD OTHERS)";

  const blocks: string[] = [];
  blocks.push(
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
  );

  return blocks.join("\n");
};

const FALLBACK_TYPES = TYPES_FOR_FALLBACK as TemplateTypeSelection[];
