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
    <footer className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="secondary"
          onClick={onPrev}
          disabled={!canGoPrev}
          title="Shortcut: Arrow Left or Backspace"
        >
          Previous
        </Button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onNext}
            disabled={!canGoNext}
            title="Shortcut: Arrow Right or Enter"
          >
            Next
          </Button>
          <Button
            variant={canSubmitReady ? "default" : "secondary"}
            onClick={onSubmit}
            title="Shortcut: Ctrl/Cmd + Enter"
          >
            Submit
          </Button>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Navigation shortcuts: Left/Right arrows, Enter/Backspace, and
        Ctrl/Cmd+Enter to submit.
      </p>
    </footer>
  );
}
