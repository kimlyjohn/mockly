"use client";

import { AlertCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";

import { examSchema } from "@/lib/schema";
import type { Exam } from "@/types/exam";

import { Button } from "./Button";
import { Card } from "./card";

interface FileDropZoneProps {
  onValidExam: (exam: Exam) => void;
}

const flattenZodError = (error: unknown): string => {
  if (typeof error !== "object" || error === null || !("issues" in error)) {
    return "Invalid JSON format. Please check your file and try again.";
  }

  const issues = (
    error as { issues?: Array<{ path: (string | number)[]; message: string }> }
  ).issues;
  if (!issues || issues.length === 0) {
    return "Invalid JSON format. Please check your file and try again.";
  }

  return issues
    .slice(0, 3)
    .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
    .join("\n");
};

export function FileDropZone({ onValidExam }: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const raw = JSON.parse(text) as unknown;
        const parsed = examSchema.parse(raw);
        setError(null);
        onValidExam(parsed);
      } catch (e) {
        setError(flattenZodError(e));
      }
    };

    reader.onerror = () => setError("Failed to read file. Please try again.");
    reader.readAsText(file);
  };

  return (
    <Card className="space-y-4 p-6 sm:p-8">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) {
            parseFile(file);
          }
        }}
        className={[
          "flex min-h-52 flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition",
          isDragging
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
            : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50",
        ].join(" ")}
      >
        <Upload className="mb-3 h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        <p className="text-sm text-slate-700 dark:text-slate-200">
          Drop your exam JSON file here
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          or choose from your device
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              parseFile(file);
            }
            event.currentTarget.value = "";
          }}
        />

        <Button
          variant="secondary"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
          leftIcon={<Upload className="h-4 w-4" />}
        >
          Select JSON File
        </Button>
      </div>

      {error && (
        <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <pre className="whitespace-pre-wrap font-sans">{error}</pre>
        </div>
      )}
    </Card>
  );
}
