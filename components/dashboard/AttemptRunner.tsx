"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { ExamFooter } from "@/components/exam-player/ExamFooter";
import { ExamHeader } from "@/components/exam-player/ExamHeader";
import { QuestionNavigator } from "@/components/exam-player/QuestionNavigator";
import { QuestionRenderer } from "@/components/exam-player/QuestionRenderer";
import { ReviewQuestionCard } from "@/components/review/ReviewQuestionCard";
import { ScoreCard } from "@/components/review/ScoreCard";
import { ConfirmSubmitModal } from "@/components/ui/ConfirmSubmitModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";
import { gradeExam, type ExamGradeResult } from "@/lib/grading";
import { useKeyboardShortcuts } from "@/lib/use-keyboard-shortcuts";
import type { Exam, UserAnswer } from "@/types/exam";

interface AttemptRunnerProps {
  attemptId: string;
}

type AttemptStatus = "in_progress" | "submitted" | "abandoned";

interface AttemptPayload {
  id: string;
  examId: string;
  status: AttemptStatus;
  currentQuestionIndex: number;
  elapsedSeconds: number;
  percentage: number | null;
  flaggedQuestionIds: string[];
  answers: Record<string, UserAnswer>;
  exam: Exam;
}

interface SubmitPayload {
  attempt: {
    id: string;
    status: AttemptStatus;
    percentage?: number;
    grade: ExamGradeResult;
  };
  exam: Exam;
}

const toTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export function AttemptRunner({ attemptId }: AttemptRunnerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptStatus, setAttemptStatus] =
    useState<AttemptStatus>("in_progress");
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [navigatorOpen, setNavigatorOpen] = useState(true);
  const [autosaveSeconds, setAutosaveSeconds] = useState(20);
  const [keyboardEnabled, setKeyboardEnabled] = useState(true);
  const [submitGrade, setSubmitGrade] = useState<ExamGradeResult | null>(null);

  const saveRef = useRef<() => Promise<void>>(async () => {});
  const lastSavedSnapshotRef = useRef("");

  const questions = exam?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];

  const activeGrade = useMemo(() => {
    if (!exam || attemptStatus !== "submitted") {
      return null;
    }
    return submitGrade ?? gradeExam(exam.questions, answers);
  }, [attemptStatus, exam, submitGrade, answers]);

  const buildProgressSnapshot = () =>
    JSON.stringify({
      currentQuestionIndex,
      elapsedSeconds,
      answers,
      flaggedQuestionIds: Array.from(flagged),
    });

  const loadAttempt = async () => {
    setLoading(true);
    setError(null);

    try {
      const [attemptResponse, settingsResponse] = await Promise.all([
        fetch(`/api/attempts/${attemptId}`, { cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" }),
      ]);

      const attemptJson = (await attemptResponse.json()) as {
        data?: AttemptPayload;
        error?: { message?: string };
      };

      if (!attemptResponse.ok || !attemptJson.data) {
        throw new Error(
          attemptJson.error?.message ?? "Failed to load attempt.",
        );
      }

      if (settingsResponse.ok) {
        const settingsJson = (await settingsResponse.json()) as {
          data?: {
            autosaveSeconds?: number;
            enableKeyboardShortcuts?: boolean;
          };
        };
        setAutosaveSeconds(settingsJson.data?.autosaveSeconds ?? 20);
        setKeyboardEnabled(settingsJson.data?.enableKeyboardShortcuts ?? true);
      }

      setExam(attemptJson.data.exam);
      setAttemptStatus(attemptJson.data.status);
      setCurrentQuestionIndex(attemptJson.data.currentQuestionIndex);
      setElapsedSeconds(attemptJson.data.elapsedSeconds);
      setAnswers(attemptJson.data.answers ?? {});
      setFlagged(new Set(attemptJson.data.flaggedQuestionIds ?? []));
      lastSavedSnapshotRef.current = JSON.stringify({
        currentQuestionIndex: attemptJson.data.currentQuestionIndex,
        elapsedSeconds: attemptJson.data.elapsedSeconds,
        answers: attemptJson.data.answers ?? {},
        flaggedQuestionIds: attemptJson.data.flaggedQuestionIds ?? [],
      });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to load attempt.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  useEffect(() => {
    if (attemptStatus !== "in_progress") {
      return;
    }

    const id = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(id);
  }, [attemptStatus]);

  const saveProgress = async (force = false) => {
    if (!exam || attemptStatus !== "in_progress") {
      return;
    }

    const snapshot = buildProgressSnapshot();
    if (!force && snapshot === lastSavedSnapshotRef.current) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: snapshot,
      });

      const payload = (await response.json()) as {
        error?: { message?: string };
      };

      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Failed to save progress.");
      }

      lastSavedSnapshotRef.current = snapshot;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to save progress.",
      );
    } finally {
      setSaving(false);
    }
  };

  saveRef.current = saveProgress;

  useEffect(() => {
    if (attemptStatus !== "in_progress") {
      return;
    }

    const id = window.setInterval(() => {
      void saveRef.current();
    }, autosaveSeconds * 1000);

    return () => window.clearInterval(id);
  }, [attemptStatus, autosaveSeconds]);

  useEffect(() => {
    const onBeforeUnload = () => {
      void saveRef.current();
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const submit = async () => {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await saveProgress(true);

      const response = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
      });

      const payload = (await response.json()) as {
        data?: SubmitPayload;
        error?: { message?: string };
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error?.message ?? "Failed to submit attempt.");
      }

      setAttemptStatus("submitted");
      setSubmitGrade(payload.data.attempt.grade);
      setExam(payload.data.exam);
      setSubmitOpen(false);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to submit attempt.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const unansweredCount = questions.filter(
    (q) => answers[q.id] === undefined,
  ).length;
  const answeredCount = questions.length - unansweredCount;

  const requestSubmit = () => {
    if (submitting) {
      return;
    }

    if (unansweredCount === 0 && flagged.size === 0) {
      void submit();
      return;
    }

    setSubmitOpen(true);
  };

  useKeyboardShortcuts({
    onPrev: () => {
      if (!keyboardEnabled) {
        return;
      }
      setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
    },
    onNext: () =>
      keyboardEnabled &&
      setCurrentQuestionIndex((prev) =>
        Math.min(prev + 1, questions.length - 1),
      ),
    onSubmit: () => {
      if (!keyboardEnabled) {
        return;
      }
      requestSubmit();
    },
    onToggleFlag: () => {
      if (!keyboardEnabled) {
        return;
      }
      if (!currentQuestion) {
        return;
      }
      setFlagged((prev) => {
        const next = new Set(prev);
        if (next.has(currentQuestion.id)) {
          next.delete(currentQuestion.id);
        } else {
          next.add(currentQuestion.id);
        }
        return next;
      });
    },
    onSelectTf: (value) => {
      if (!keyboardEnabled) {
        return;
      }
      if (currentQuestion?.type === "true_false") {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
      }
    },
    onSelectMcqByIndex: (index) => {
      if (!keyboardEnabled) {
        return;
      }
      if (currentQuestion?.type !== "multiple_choice") {
        return;
      }
      const option = currentQuestion.options[index];
      if (!option) {
        return;
      }
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));
    },
  });

  if (loading) {
    return <Card>Loading attempt...</Card>;
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        <Button
          className="mt-3"
          variant="secondary"
          onClick={() => void loadAttempt()}
        >
          Retry
        </Button>
      </Card>
    );
  }

  if (!exam || !currentQuestion) {
    return <Card>Attempt unavailable.</Card>;
  }

  if (attemptStatus === "submitted") {
    if (!activeGrade) {
      return <Card>Loading results...</Card>;
    }

    return (
      <section className="space-y-4">
        <ScoreCard
          percentage={activeGrade.percentage}
          totalScore={activeGrade.totalScore}
          maxScore={activeGrade.maxScore}
          passingScore={exam.metadata.passingScore}
          questions={exam.questions}
        />

        <div className="space-y-3">
          {exam.questions.map((question, index) => (
            <ReviewQuestionCard
              key={question.id}
              index={index}
              question={question}
              userAnswer={answers[question.id]}
              grade={activeGrade.perQuestion[question.id]}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {submitting && (
        <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          Submitting your exam...
        </p>
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
        <span>Time elapsed: {toTime(elapsedSeconds)}</span>
        {saving && (
          <span className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        )}
      </div>

      <div
        className={`grid items-start gap-4 transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none ${
          navigatorOpen
            ? "md:grid-cols-[minmax(0,1fr)_20rem]"
            : "md:grid-cols-[minmax(0,1fr)_0rem]"
        }`}
      >
        <div className="min-w-0 space-y-4">
          <ExamHeader
            title={exam.title}
            currentIndex={currentQuestionIndex}
            answeredCount={answeredCount}
            total={questions.length}
            isNavigatorOpen={navigatorOpen}
            isCurrentFlagged={flagged.has(currentQuestion.id)}
            onToggleNavigator={() => setNavigatorOpen((prev) => !prev)}
            onToggleFlag={() => {
              setFlagged((prev) => {
                const next = new Set(prev);
                if (next.has(currentQuestion.id)) {
                  next.delete(currentQuestion.id);
                } else {
                  next.add(currentQuestion.id);
                }
                return next;
              });
            }}
          />

          <Card>
            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentQuestion.id]}
              onChange={(answer) =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.id]: answer,
                }))
              }
            />
          </Card>

          <ExamFooter
            canGoPrev={currentQuestionIndex > 0}
            canGoNext={currentQuestionIndex < questions.length - 1}
            canSubmitReady={unansweredCount === 0}
            onPrev={() =>
              setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
            }
            onNext={() =>
              setCurrentQuestionIndex((prev) =>
                Math.min(prev + 1, questions.length - 1),
              )
            }
            onSubmit={requestSubmit}
          />
        </div>

        <div
          className={`overflow-hidden transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            navigatorOpen
              ? "opacity-100"
              : "hidden md:block md:pointer-events-none md:opacity-0"
          }`}
        >
          <QuestionNavigator
            currentIndex={currentQuestionIndex}
            answeredIds={new Set(Object.keys(answers))}
            flaggedIds={flagged}
            questions={questions.map((q) => ({ id: q.id, type: q.type }))}
            visible
            onJump={setCurrentQuestionIndex}
            className="w-full md:w-80 md:sticky md:top-4"
          />
        </div>
      </div>

      <ConfirmSubmitModal
        isOpen={submitOpen}
        unansweredCount={unansweredCount}
        flaggedCount={flagged.size}
        onCancel={() => setSubmitOpen(false)}
        onConfirm={() => void submit()}
        disableConfirm={submitting}
        confirmLabel={submitting ? "Submitting..." : "Submit Anyway"}
      />

      {!keyboardEnabled && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Keyboard shortcuts are disabled from settings.
        </p>
      )}
    </section>
  );
}
