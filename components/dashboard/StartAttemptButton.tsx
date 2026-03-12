"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface StartAttemptButtonProps {
  examId: string;
  sourceAttemptId?: string;
  retryIncorrect?: boolean;
}

interface StartAttemptPayload {
  data?: {
    attempt?: {
      id: string;
    };
  };
  error?: {
    message?: string;
  };
}

export function StartAttemptButton({
  examId,
  sourceAttemptId,
  retryIncorrect = false,
}: StartAttemptButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);

    try {
      const response = await fetch(`/api/exams/${examId}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: retryIncorrect ? "retry_incorrect" : "normal",
          sourceAttemptId,
        }),
      });

      const rawBody = await response.text();
      const payload: StartAttemptPayload | null = rawBody
        ? ((JSON.parse(rawBody) as StartAttemptPayload) ?? null)
        : null;

      if (!response.ok || !payload?.data?.attempt?.id) {
        throw new Error(
          payload?.error?.message ??
            `Failed to start attempt (HTTP ${response.status}).`,
        );
      }

      router.push(`/attempts/${payload.data.attempt.id}`);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to start attempt.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={start}
        disabled={busy}
        leftIcon={
          busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )
        }
      >
        {busy
          ? "Starting..."
          : retryIncorrect
            ? "Retry Incorrect"
            : "Start New Attempt"}
      </Button>
      {error && (
        <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
      )}
    </div>
  );
}
