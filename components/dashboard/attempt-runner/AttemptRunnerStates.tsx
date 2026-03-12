"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/card";

export function AttemptLoadingState() {
  return <Card>Loading attempt...</Card>;
}

interface AttemptErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function AttemptErrorState({ error, onRetry }: AttemptErrorStateProps) {
  return (
    <Card>
      <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
      <Button className="mt-3" variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </Card>
  );
}

export function AttemptSubmittingState() {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div>
        <p className="text-lg font-semibold">Submitting your exam…</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Please wait while your answers are being saved.
        </p>
      </div>
    </Card>
  );
}
