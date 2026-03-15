"use client";

import Link from "next/link";
import { Clock3, Loader2, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage, readApiResponse } from "@/lib/api-client";
import {
  useAttemptHistory,
  type ExamAttemptHistoryItem,
} from "@/hooks/useAttemptHistory";
import { useQueryClient } from "@tanstack/react-query";

interface ExamHistoryDialogProps {
  examId: string;
  examTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fmt = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const fmtDuration = (seconds: number) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

const formatScore = (value: number | null) => {
  if (value === null) {
    return null;
  }

  const rounded = Math.round(value);
  if (Math.abs(value - rounded) < 0.01) {
    return String(rounded);
  }

  return value.toFixed(1);
};

const statusVariant = (status: ExamAttemptHistoryItem["status"]) => {
  if (status === "in_progress") return "secondary" as const;
  if (status === "submitted") return "default" as const;
  return "outline" as const;
};

const statusLabel = (status: ExamAttemptHistoryItem["status"]) =>
  status.replaceAll("_", " ");

export function ExamHistoryDialog({
  examId,
  examTitle,
  open,
  onOpenChange,
}: ExamHistoryDialogProps) {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading: loading, error: queryError } = useAttemptHistory(
    examId,
    open
  );

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const error = queryError?.message || deleteError;

  const submittedCount = useMemo(
    () => items.filter((item) => item.status === "submitted").length,
    [items],
  );

  const onDeleteAttempt = async (attemptId: string) => {
    setDeletingId(attemptId);
    setDeleteError(null);

    try {
      const response = await fetch(`/api/attempts/${attemptId}`, {
        method: "DELETE",
      });
      const payload = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(response, payload, "Failed to delete attempt."),
        );
      }

      await queryClient.invalidateQueries({
        queryKey: ["exams", examId, "attempts"],
      });
      setConfirmDeleteId(null);
    } catch (caught) {
      setDeleteError(
        caught instanceof Error ? caught.message : "Failed to delete attempt.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] sm:max-h-[70vh] max-w-2xl overflow-hidden p-0 flex flex-col">
        <DialogHeader className="border-b border-border px-4 py-3 sm:px-5">
          <DialogTitle>Attempt History</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {examTitle} • {items.length} total • {submittedCount} submitted
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto px-4 py-3 sm:px-5">
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading attempt history...
              </span>
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
              No attempts found for this exam yet.
            </div>
          )}

          {!loading &&
            items.map((item) => {
              const scoreLine =
                item.status === "submitted" &&
                item.totalScore !== null &&
                item.maxScore !== null
                  ? `${formatScore(item.totalScore)} of ${formatScore(item.maxScore)}`
                  : null;

              return (
                <article
                  key={item.id}
                  className="space-y-2 rounded-xl border border-slate-200 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-900/90"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(item.status)}>
                        {statusLabel(item.status)}
                      </Badge>
                      <Badge variant="outline">
                        <Clock3 className="h-3 w-3" />
                        {fmtDuration(item.elapsedSeconds)}
                      </Badge>
                      {item.status === "in_progress" && (
                        <Badge variant="secondary">
                          Question {item.currentQuestionIndex + 1}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" className="h-7 px-2.5 text-xs">
                        <Link href={`/attempts/${item.id}`}>
                          {item.status === "submitted"
                            ? "Open Result"
                            : "Continue"}
                        </Link>
                      </Button>

                      {confirmDeleteId === item.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 px-2.5 text-xs"
                            disabled={deletingId === item.id}
                            onClick={() => void onDeleteAttempt(item.id)}
                          >
                            {deletingId === item.id ? "Deleting..." : "Confirm"}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2.5 text-xs"
                            onClick={() => setConfirmDeleteId(null)}
                            disabled={deletingId === item.id}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          aria-label="Delete attempt history item"
                          onClick={() => setConfirmDeleteId(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{item.answersCount} answers</span>
                    <span>Created {fmt(item.createdAt)}</span>
                    <span>Updated {fmt(item.updatedAt)}</span>
                    {item.submittedAt && (
                      <span>Submitted {fmt(item.submittedAt)}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.percentage !== null && (
                      <Badge variant="secondary">
                        {item.percentage.toFixed(1)}%
                      </Badge>
                    )}
                    {scoreLine && <Badge variant="outline">{scoreLine}</Badge>}
                  </div>
                </article>
              );
            })}

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="mx-0 border-t border-border px-4 py-3 sm:px-5">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
