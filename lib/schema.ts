import { z } from "zod";

const baseQuestionSchema = z.object({
  id: z.string().min(1, "Question id is required."),
  prompt: z.string().min(1, "Question prompt is required."),
  explanation: z.string().min(1, "Question explanation is required."),
});

const trueFalseSchema = baseQuestionSchema.extend({
  type: z.literal("true_false"),
  correctAnswer: z.enum(["true", "false"]),
});

const multipleChoiceSchema = baseQuestionSchema.extend({
  type: z.literal("multiple_choice"),
  options: z
    .array(z.string().min(1))
    .min(2, "Multiple choice requires at least 2 options."),
  correctAnswer: z.string().min(1),
});

const identificationWithChoicesSchema = baseQuestionSchema.extend({
  type: z.literal("identification"),
  hasChoices: z.literal(true),
  options: z.array(z.string().min(1)).min(1),
  correctAnswer: z.string().min(1),
});

const identificationNoChoicesSchema = baseQuestionSchema.extend({
  type: z.literal("identification"),
  hasChoices: z.literal(false),
  correctAnswer: z.string().min(1),
});

const matchingSchema = baseQuestionSchema.extend({
  type: z.literal("matching"),
  options: z
    .object({
      left: z.array(z.string().min(1)).min(1),
      right: z.array(z.string().min(1)).min(1),
    })
    .refine((value) => value.left.length === value.right.length, {
      message:
        "Matching options.left and options.right must have equal length.",
      path: ["right"],
    }),
  correctAnswer: z.record(z.string(), z.string()),
});

const enumerationSchema = baseQuestionSchema.extend({
  type: z.literal("enumeration"),
  correctAnswer: z.array(z.string().min(1)).min(1),
  orderedAnswer: z.boolean().optional().default(false),
});

export const questionSchema = z.union([
  trueFalseSchema,
  multipleChoiceSchema,
  identificationWithChoicesSchema,
  identificationNoChoicesSchema,
  matchingSchema,
  enumerationSchema,
]);

export const examSchema = z
  .object({
    title: z.string().min(1, "Exam title is required."),
    description: z.string().min(1, "Exam description is required."),
    metadata: z.object({
      totalQuestions: z.number().int().positive(),
      passingScore: z.number().min(0).max(100),
      subject: z.string().optional(),
      shuffleQuestions: z.boolean().optional().default(false),
      shuffleOptions: z.boolean().optional().default(false),
    }),
    questions: z
      .array(questionSchema)
      .min(1, "At least one question is required."),
  })
  .superRefine((exam, ctx) => {
    if (exam.metadata.totalQuestions !== exam.questions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "metadata.totalQuestions must equal questions.length.",
        path: ["metadata", "totalQuestions"],
      });
    }

    const idSet = new Set<string>();
    exam.questions.forEach((question, index) => {
      if (idSet.has(question.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate question id: ${question.id}`,
          path: ["questions", index, "id"],
        });
      }
      idSet.add(question.id);

      if (question.type === "multiple_choice") {
        const hasAnswer = question.options.some(
          (opt) =>
            opt.trim().toLowerCase() ===
            question.correctAnswer.trim().toLowerCase(),
        );
        if (!hasAnswer) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "correctAnswer must exist in options for multiple_choice.",
            path: ["questions", index, "correctAnswer"],
          });
        }
      }

      if (question.type === "identification" && question.hasChoices) {
        const hasAnswer = question.options.some(
          (opt) =>
            opt.trim().toLowerCase() ===
            question.correctAnswer.trim().toLowerCase(),
        );
        if (!hasAnswer) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "correctAnswer must exist in options for identification with choices.",
            path: ["questions", index, "correctAnswer"],
          });
        }
      }

      if (question.type === "matching") {
        const keys = Object.keys(question.correctAnswer);
        const leftSet = new Set(question.options.left);
        const rightSet = new Set(question.options.right);

        if (keys.length !== question.options.left.length) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "correctAnswer must include every item in options.left.",
            path: ["questions", index, "correctAnswer"],
          });
        }

        for (const left of keys) {
          const right = question.correctAnswer[left];
          if (!leftSet.has(left) || !rightSet.has(right)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message:
                "Matching correctAnswer keys/values must exist in options.left/options.right.",
              path: ["questions", index, "correctAnswer"],
            });
            break;
          }
        }
      }
    });
  });

export type ExamInput = z.input<typeof examSchema>;
export type ExamOutput = z.output<typeof examSchema>;
