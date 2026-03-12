"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { AttemptInProgressView } from "@/components/dashboard/attempt-runner/AttemptInProgressView";
import {
  AttemptErrorState,
  AttemptLoadingState,
  AttemptSubmittingState,
} from "@/components/dashboard/attempt-runner/AttemptRunnerStates";
import { LeaveAttemptModal } from "@/components/dashboard/attempt-runner/LeaveAttemptModal";
import { SubmittedResultsPanel } from "@/components/dashboard/attempt-runner/SubmittedResultsPanel";
import {
  formatElapsedTime,
  type AttemptPayload,
  type AttemptStatus,
  type SubmitPayload,
} from "@/components/dashboard/attempt-runner/types";
import { useAttemptLeaveGuard } from "@/hooks/attempt-runner/useAttemptLeaveGuard";
import { useRetakeAttempt } from "@/hooks/attempt-runner/useRetakeAttempt";
import { useAttemptShortcuts } from "@/hooks/attempt-runner/useAttemptShortcuts";
import { ConfirmSubmitModal } from "@/components/ui/ConfirmSubmitModal";
import { Card } from "@/components/ui/card";
import { gradeExam, type ExamGradeResult } from "@/lib/grading";
import type { Exam, UserAnswer } from "@/types/exam";

interface AttemptRunnerProps {
  attemptId: string;
}

export function AttemptRunner({ attemptId }: AttemptRunnerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examId, setExamId] = useState<string | null>(null);
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

  const saveRef = useRef<(force?: boolean) => Promise<void>>(async () => {});
  const lastSavedSnapshotRef = useRef("");
  const { retaking, startRetake } = useRetakeAttempt({
    examId,
    onError: (message) => setError(message || null),
  });

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

  const hasUnsavedChanges =
    attemptStatus === "in_progress" &&
    buildProgressSnapshot() !== lastSavedSnapshotRef.current;

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
      setExamId(attemptJson.data.examId);
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

  const leaveGuard = useAttemptLeaveGuard({
    enabled: attemptStatus === "in_progress",
    hasUnsavedChanges,
    onSaveBeforeLeave: () => saveRef.current(true),
    onNavigate: (targetUrl) => {
      window.location.assign(targetUrl);
    },
  });

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

  useAttemptShortcuts({
    keyboardEnabled,
    currentQuestion,
    questionsLength: questions.length,
    onPrev: () => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0)),
    onNext: () =>
      setCurrentQuestionIndex((prev) =>
        Math.min(prev + 1, questions.length - 1),
      ),
    onSubmit: requestSubmit,
    onToggleFlag: () => {
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
    onSetAnswer: (questionId, answer) =>
      setAnswers((prev) => ({ ...prev, [questionId]: answer })),
  });

  if (loading) {
    return <AttemptLoadingState />;
  }

  if (error) {
    return (
      <AttemptErrorState error={error} onRetry={() => void loadAttempt()} />
    );
  }

  if (!exam || !currentQuestion) {
    return <Card>Attempt unavailable.</Card>;
  }

  if (submitting) {
    return <AttemptSubmittingState />;
  }

  if (attemptStatus === "submitted") {
    if (!activeGrade) {
      return <Card>Loading results...</Card>;
    }

    return (
      <SubmittedResultsPanel
        exam={exam}
        answers={answers}
        grade={activeGrade}
        onRetake={() => void startRetake()}
        retaking={retaking}
      />
    );
  }

  return (
    <section className="space-y-4">
      <AttemptInProgressView
        exam={exam}
        currentQuestion={currentQuestion}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        elapsedTimeText={formatElapsedTime(elapsedSeconds)}
        saving={saving}
        answers={answers}
        flagged={flagged}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        navigatorOpen={navigatorOpen}
        keyboardEnabled={keyboardEnabled}
        onChangeAnswer={(answer) =>
          setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: answer,
          }))
        }
        onPrev={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
        onNext={() =>
          setCurrentQuestionIndex((prev) =>
            Math.min(prev + 1, questions.length - 1),
          )
        }
        onSubmit={requestSubmit}
        onJump={setCurrentQuestionIndex}
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

      <ConfirmSubmitModal
        isOpen={submitOpen}
        unansweredCount={unansweredCount}
        flaggedCount={flagged.size}
        onCancel={() => setSubmitOpen(false)}
        onConfirm={() => void submit()}
        disableConfirm={submitting}
        confirmLabel={submitting ? "Submitting..." : "Submit Anyway"}
      />

      <LeaveAttemptModal
        isOpen={leaveGuard.isConfirmOpen}
        confirming={leaveGuard.confirming}
        onCancel={leaveGuard.cancelNavigation}
        onConfirm={() => void leaveGuard.confirmNavigation()}
      />
    </section>
  );
}
