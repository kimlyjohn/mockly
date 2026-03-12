type TemplateTypeLike =
  | "true_false"
  | "multiple_choice"
  | "identification_no_choices"
  | "identification_with_choices"
  | "matching"
  | "enumeration";

export const formatTypeForDisplay = (type: TemplateTypeLike): string => {
  if (type === "identification_no_choices") {
    return "identification (without choices)";
  }
  if (type === "identification_with_choices") {
    return "identification (with choices)";
  }
  return type;
};

export const EXAM_REALISM_DISTRIBUTION: Record<
  TemplateTypeLike,
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

export const SOURCE_ANALYSIS_INSTRUCTIONS = [
  "Before writing any questions, analyze the source material for the following testable elements:",
  "  1. KEY DEFINITIONS — every term that is explicitly defined in the source. These become true/false and identification questions.",
  "  2. NUMBERED LISTS — every list with a fixed count (e.g. '5 elements', '3 principles', '4 steps'). Each complete list becomes one enumeration question.",
  "  3. NAMED DOCTRINES / PRINCIPLES / THEORIES — every named concept becomes a potential identification or matching item.",
  "  4. PEOPLE, DATES, LAWS, CASES — landmark facts that professors commonly test. These become identification or true/false items.",
  "  5. COMMON CONFUSIONS — pairs of concepts that students commonly confuse (e.g. two doctrines with similar names, two zones with similar distances). These become true/false traps.",
  "  6. CAUSE-AND-EFFECT RELATIONSHIPS — use these for multiple_choice questions that test conceptual understanding.",
  "After identifying all testable elements, THEN decide the question type and count for each element.",
] as const;

export const TRUE_FALSE_TRAP_PATTERNS = [
  "When writing FALSE true/false statements, use EXACTLY ONE of these professor-style traps per question:",
  "  TRAP 1 — WORD SWAP: Replace one key word with a wrong but similar-sounding word (e.g. 'Transportation' instead of 'Transformation').",
  "  TRAP 2 — NUMBER SWAP: Replace a specific number with a wrong number (e.g. '24 nautical miles' instead of '12 nautical miles' for the territorial sea).",
  "  TRAP 3 — DEFINITION INVERSION: Apply the correct definition of Concept A to Concept B (e.g. write the definition of international law but label it as national law).",
  "  TRAP 4 — LIST CONTAMINATION: Include one wrong item in an otherwise correct list (e.g. list 4 correct founding members but add one non-member like Vietnam instead of the correct fifth).",
  "  TRAP 5 — ATTRIBUTE SWAP: Swap a specific attribute between two related concepts (e.g. swap which doctrine covers 'revolution' vs. 'military coup').",
  "  TRAP 6 — NEAR-MISS BODY/LAW: Reference a real concept but assign it to the wrong legal instrument (e.g. attribute a principle to the wrong Declaration or Convention).",
  "Do NOT write FALSE statements that are obviously wrong. The statement must look credible at first glance.",
] as const;

export const TYPES_FOR_FALLBACK: TemplateTypeLike[] = [
  "true_false",
  "multiple_choice",
  "identification_no_choices",
  "identification_with_choices",
  "matching",
  "enumeration",
];
