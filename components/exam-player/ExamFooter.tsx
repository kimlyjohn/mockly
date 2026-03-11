"use client";

import { Button } from "@/components/ui/Button";

interface ExamFooterProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  canSubmitReady: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function ExamFooter({
  canGoPrev,
  canGoNext,
  canSubmitReady,
  onPrev,
  onNext,
  onSubmit,
}: ExamFooterProps) {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <Button variant="secondary" onClick={onPrev} disabled={!canGoPrev}>
        Previous
      </Button>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onNext} disabled={!canGoNext}>
          Next
        </Button>
        <Button
          variant={canSubmitReady ? "default" : "secondary"}
          onClick={onSubmit}
        >
          Submit
        </Button>
      </div>
    </footer>
  );
}
