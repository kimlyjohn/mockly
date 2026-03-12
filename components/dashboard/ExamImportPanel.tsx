"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, FileJson, Loader2, Upload } from "lucide-react";
import { ZodError } from "zod";

import { examSchema } from "@/lib/schema";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/textarea";
import { TemplateGeneratorModal } from "@/components/ui/template-generator-modal";

interface ExamImportPanelProps {
  onImported?: () => void;
}

interface MatchingOptionItem {
  id: string;
  text: string;
}

interface ToastState {
  kind: "success" | "error";
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
  const options = question.options;
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
  if (!isObjectStyle) {
    return question;
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

const normalizeExamInput = (raw: unknown): unknown => {
  if (!isRecord(raw) || !Array.isArray(raw.questions)) {
    return raw;
  }

  const normalizedQuestions = raw.questions.map((question) => {
    if (!isRecord(question) || question.type !== "matching") {
      return question;
    }
    return normalizeMatchingQuestion(question);
  });

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

const unwrapExamPayload = (raw: unknown): unknown => {
  if (!isRecord(raw)) {
    return raw;
  }

  // Common wrapper from API exports/imports: { exam: { ... } }
  if (isRecord(raw.exam)) {
    return raw.exam;
  }

  // Common wrapper from other tools: { data: { ... } }
  if (isRecord(raw.data)) {
    return raw.data;
  }

  // Allow single-item arrays containing an exam object.
  if (Array.isArray(raw.exams) && raw.exams.length === 1) {
    return raw.exams[0];
  }

  return raw;
};

const formatImportError = (caught: unknown): string => {
  if (caught instanceof ZodError) {
    return caught.issues
      .slice(0, 5)
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join(".") : "root";
        return `${path}: ${issue.message}`;
      })
      .join("\n");
  }

  if (caught instanceof SyntaxError) {
    return "Invalid JSON format. Check commas, quotes, and brackets.";
  }

  return caught instanceof Error ? caught.message : "Invalid JSON input.";
};

export function ExamImportPanel({ onImported }: ExamImportPanelProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (next: ToastState) => {
    setToast(next);
    window.setTimeout(() => {
      setToast((current) => (current?.text === next.text ? null : current));
    }, 3500);
  };

  const importExamPayload = async (
    raw: unknown,
    source: string,
    filename?: string,
    rawSize?: number,
  ): Promise<string> => {
    const unwrapped = unwrapExamPayload(raw);
    const normalizedRaw = normalizeExamInput(unwrapped);
    const parsed = examSchema.parse(normalizedRaw);

    const response = await fetch("/api/exams", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exam: parsed,
        filename,
        source,
        rawSize,
      }),
    });

    const payload = (await response.json()) as {
      data?: {
        id?: string;
      };
      error?: {
        message?: string;
      };
    };

    if (!response.ok || !payload.data?.id) {
      throw new Error(payload.error?.message ?? "Failed to import exam.");
    }

    return payload.data.id;
  };

  const onFile = async (file: File) => {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const text = await file.text();
      const raw = JSON.parse(text) as unknown;
      const createdExamId = await importExamPayload(
        raw,
        "dashboard_upload",
        file.name,
        file.size,
      );

      setMessage("Exam imported successfully.");
      showToast({ kind: "success", text: "Exam imported successfully." });
      onImported?.();
      router.push(`/library/${createdExamId}`);
      return;
    } catch (caught) {
      const formatted = formatImportError(caught);
      setError(formatted);
      showToast({
        kind: "error",
        text: "Import failed. Review validation details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasteImport = async () => {
    setError(null);
    setMessage(null);

    const trimmed = jsonInput.trim();
    if (!trimmed) {
      setError("Paste your JSON content first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const raw = JSON.parse(trimmed) as unknown;
      const createdExamId = await importExamPayload(
        raw,
        "dashboard_paste",
        "pasted-exam.json",
        trimmed.length,
      );
      setMessage("Exam imported successfully from pasted JSON.");
      showToast({
        kind: "success",
        text: "Exam imported successfully from pasted JSON.",
      });
      setJsonInput("");
      onImported?.();
      router.push(`/library/${createdExamId}`);
      return;
    } catch (caught) {
      const formatted = formatImportError(caught);
      setError(formatted);
      showToast({
        kind: "error",
        text: "Import failed. Review validation details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <FileJson className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold">Import Exam JSON</h2>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void onFile(file);
          }
          event.currentTarget.value = "";
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={isSubmitting}
          leftIcon={
            isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )
          }
        >
          {isSubmitting ? "Importing..." : "Choose JSON File"}
        </Button>
        <Button
          variant="secondary"
          leftIcon={<Bot className="h-4 w-4" />}
          onClick={() => setTemplateOpen(true)}
        >
          Open AI Exam Prompt Builder
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
        <p className="font-medium text-emerald-900 dark:text-emerald-100">
          New here?
        </p>
        <p className="mt-1 text-emerald-800/90 dark:text-emerald-200/90">
          1) Copy prompt from AI Exam Prompt Builder, 2) paste it in
          ChatGPT/Claude/Gemini with your lessons/sources, 3) paste the
          generated JSON here, then import.
        </p>
      </div>

      <div className="mt-4 space-y-2 rounded-xl border border-border bg-muted/30 p-3">
        <p className="text-sm font-medium text-foreground">
          Or paste exam JSON directly
        </p>
        <Textarea
          value={jsonInput}
          onChange={(event) => setJsonInput(event.target.value)}
          placeholder='Paste full exam JSON here, e.g. {"title":"..."}'
          rows={10}
          className="min-h-72 font-mono text-sm"
        />
        <div className="flex justify-end">
          <Button
            variant="secondary"
            onClick={() => void onPasteImport()}
            disabled={isSubmitting}
            leftIcon={
              isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null
            }
          >
            {isSubmitting ? "Importing..." : "Import Pasted JSON"}
          </Button>
        </div>
      </div>

      {message && <p className="mt-3 text-sm text-primary">{message}</p>}
      {error && (
        <p className="mt-3 whitespace-pre-line text-sm text-destructive">
          {error}
        </p>
      )}

      <TemplateGeneratorModal
        isOpen={templateOpen}
        onClose={() => setTemplateOpen(false)}
      />

      {toast && (
        <div
          className={[
            "fixed right-4 top-4 z-50 rounded-lg px-4 py-3 text-sm shadow-lg",
            toast.kind === "success"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "border border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300",
          ].join(" ")}
        >
          {toast.text}
        </div>
      )}
    </section>
  );
}
