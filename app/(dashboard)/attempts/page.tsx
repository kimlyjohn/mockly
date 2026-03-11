import Link from "next/link";

import { AttemptItemMenu } from "@/components/dashboard/AttemptItemMenu";
import { Badge } from "@/components/ui/badge";
import { listAttempts } from "@/lib/server/dashboard-data";

export const dynamic = "force-dynamic";

const fmt = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

export default async function AttemptsPage() {
  const attempts = await listAttempts();

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

  const statusVariant = (status: string) => {
    if (status === "in_progress") return "secondary" as const;
    if (status === "submitted") return "default" as const;
    return "outline" as const;
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header className="rounded-2xl border border-emerald-100/70 bg-linear-to-r from-emerald-50/80 via-cyan-50/60 to-slate-50/70 p-4 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-cyan-950/20 dark:to-slate-900/40">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Attempts
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Global feed of in-progress and submitted attempts across all exams.
        </p>
      </header>

      <div className="grid gap-3">
        {attempts.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No attempts recorded yet.
          </p>
        )}

        {attempts.map((attempt) => {
          const isSubmitted = attempt.status === "submitted";
          const percentage = attempt.percentage;
          const hasPercentage = percentage !== null;
          const isPassed =
            isSubmitted &&
            hasPercentage &&
            percentage >= attempt.examPassingScore;
          const scoreLine =
            isSubmitted &&
            attempt.totalScore !== null &&
            attempt.maxScore !== null
              ? `${formatScore(attempt.totalScore)} of ${formatScore(attempt.maxScore)}`
              : null;

          return (
            <article
              key={attempt.id}
              className="group relative rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/95 dark:hover:border-emerald-800"
            >
              <Link
                href={`/attempts/${attempt.id}`}
                aria-label={`Open attempt for ${attempt.examTitle}`}
                className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
              />

              <div className="pointer-events-none relative z-20 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {attempt.examTitle}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {attempt.examSubject ?? "General"}
                  </p>
                </div>

                <div className="pointer-events-auto relative z-30 flex items-start gap-2">
                  <Badge variant={statusVariant(attempt.status)}>
                    {attempt.status.replaceAll("_", " ")}
                  </Badge>
                  <AttemptItemMenu
                    attemptId={attempt.id}
                    examTitle={attempt.examTitle}
                  />
                </div>
              </div>

              {isSubmitted && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant={isPassed ? "default" : "destructive"}>
                    {isPassed ? "Passed" : "Failed"}
                  </Badge>
                  {hasPercentage && (
                    <Badge variant="secondary">{percentage.toFixed(1)}%</Badge>
                  )}
                  {scoreLine && <Badge variant="outline">{scoreLine}</Badge>}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Mode {attempt.mode.replaceAll("_", " ")}</span>
                <span>{attempt.answersCount} answers</span>
                <span>{attempt.flagsCount} flags</span>
                <span>Updated {fmt(attempt.updatedAt)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
