"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UseRetakeAttemptOptions {
  examId: string | null;
  onError: (message: string) => void;
}

export function useRetakeAttempt({ examId, onError }: UseRetakeAttemptOptions) {
  const router = useRouter();
  const [retaking, setRetaking] = useState(false);

  const startRetake = async () => {
    if (!examId || retaking) {
      return;
    }

    setRetaking(true);
    onError("");

    try {
      const response = await fetch(`/api/exams/${examId}/attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "normal",
        }),
      });

      const payload = (await response.json()) as {
        data?: {
          attempt?: {
            id: string;
          };
        };
        error?: { message?: string };
      };

      if (!response.ok || !payload.data?.attempt?.id) {
        throw new Error(payload.error?.message ?? "Failed to start retake.");
      }

      router.push(`/attempts/${payload.data.attempt.id}`);
      router.refresh();
    } catch (caught) {
      onError(
        caught instanceof Error ? caught.message : "Failed to start retake.",
      );
    } finally {
      setRetaking(false);
    }
  };

  return {
    retaking,
    startRetake,
  };
}
