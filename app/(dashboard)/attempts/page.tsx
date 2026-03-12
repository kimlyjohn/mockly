import Link from "next/link";
import { ClipboardList, Clock3 } from "lucide-react";

import { AttemptItemMenu } from "@/components/dashboard/AttemptItemMenu";
import { Badge } from "@/components/ui/badge";
import {
  listAttemptsPaginated,
  type AttemptFilterStatus,
} from "@/lib/server/dashboard-data";

export const dynamic = "force-dynamic";

const fmt = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

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

const statusVariant = (status: string) => {
  if (status === "in_progress") return "secondary" as const;
  if (status === "submitted") return "default" as const;
  return "outline" as const;
};

const statusLabel = (status: string) => {
  return status.replaceAll("_", " ");
};

interface AttemptsPageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    view?: string;
  }>;
}

type ViewMode = "chronological" | "grouped";
type FilterMode = "all" | "in_progress" | "submitted";

function buildAttemptsHref(page: number, status: FilterMode, view: ViewMode) {
  const params = new URLSearchParams();
  if (page > 1) {
    params.set("page", String(page));
  }
  if (status !== "all") {
    params.set("status", status);
  }
  if (view !== "chronological") {
    params.set("view", view);
  }
  const qs = params.toString();
  return qs ? `/attempts?${qs}` : "/attempts";
}

export default async function AttemptsPage({
  searchParams,
}: AttemptsPageProps) {
  const { page, status, view } = await searchParams;

  const parsedPage = Number.parseInt(page ?? "1", 10);
  const requestedPage = Number.isFinite(parsedPage) ? parsedPage : 1;

  const statusParam =
    status === "in_progress" || status === "submitted" ? status : "all";
  const viewMode: ViewMode = view === "grouped" ? "grouped" : "chronological";

  const statusFilterForQuery: AttemptFilterStatus | undefined =
    statusParam === "all" ? undefined : statusParam;

  const {
    items: attempts,
    totalPages,
    total,
  } = await listAttemptsPaginated(requestedPage, 8, statusFilterForQuery);

  const boundedPage = Math.min(Math.max(1, requestedPage), totalPages);

  const groups =
    viewMode === "grouped"
      ? Array.from(
          attempts
            .reduce(
              (acc, attempt) => {
                const key = attempt.examId;
                if (!acc.has(key)) {
                  acc.set(key, {
                    examId: attempt.examId,
                    examTitle: attempt.examTitle,
                    examSubject: attempt.examSubject,
                    attempts: [] as typeof attempts,
                  });
                }
                acc.get(key)?.attempts.push(attempt);
                return acc;
              },
              new Map<
                string,
                {
                  examId: string;
                  examTitle: string;
                  examSubject: string | null;
                  attempts: typeof attempts;
                }
              >(),
            )
            .values(),
        )
      : [];

  const renderAttemptCard = (attempt: (typeof attempts)[number]) => {
    const isSubmitted = attempt.status === "submitted";
    const percentage = attempt.percentage;
    const hasPercentage = percentage !== null;
    const isPassed =
      isSubmitted && hasPercentage && percentage >= attempt.examPassingScore;
    const scoreLine =
      isSubmitted && attempt.totalScore !== null && attempt.maxScore !== null
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
              {statusLabel(attempt.status)}
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
            {attempt.submittedAt && (
              <Badge variant="outline">
                Submitted {fmt(attempt.submittedAt)}
              </Badge>
            )}
            <Badge variant="outline">
              <Clock3 className="h-3 w-3" />
              {fmtDuration(attempt.elapsedSeconds)}
            </Badge>
          </div>
        )}

        {!isSubmitted && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="secondary">
              Question {attempt.currentQuestionIndex + 1}
            </Badge>
            <Badge variant="outline">
              <Clock3 className="h-3 w-3" />
              {fmtDuration(attempt.elapsedSeconds)}
            </Badge>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{attempt.answersCount} answers</span>
          <span>{attempt.flagsCount} flags</span>
          <span>Updated {fmt(attempt.updatedAt)}</span>
        </div>
      </article>
    );
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header className="rounded-2xl border border-emerald-100/70 bg-linear-to-r from-emerald-50/80 via-cyan-50/60 to-slate-50/70 p-4 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-cyan-950/20 dark:to-slate-900/40">
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Attempts
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Browse attempt history across your exams with quick filters and pages.
        </p>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          {(
            [
              { key: "all", label: "All" },
              { key: "in_progress", label: "In Progress" },
              { key: "submitted", label: "Submitted" },
            ] as const
          ).map((option) => {
            const active = statusParam === option.key;
            return (
              <Link
                key={option.key}
                href={buildAttemptsHref(1, option.key, viewMode)}
                className={
                  active
                    ? "rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "rounded-lg border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                }
              >
                {option.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-slate-500 dark:text-slate-400">View</span>
          <Link
            href={buildAttemptsHref(1, statusParam, "chronological")}
            className={
              viewMode === "chronological"
                ? "rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "rounded-lg border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            }
          >
            Chronological
          </Link>
          <Link
            href={buildAttemptsHref(1, statusParam, "grouped")}
            className={
              viewMode === "grouped"
                ? "rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "rounded-lg border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            }
          >
            Group by Exam
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
        <p>
          Page {boundedPage} of {totalPages} ({total} attempts)
        </p>
        <div className="flex items-center gap-2">
          {boundedPage <= 1 ? (
            <span className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 dark:border-slate-800 dark:text-slate-500">
              Previous
            </span>
          ) : (
            <Link
              href={buildAttemptsHref(boundedPage - 1, statusParam, viewMode)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </Link>
          )}

          {boundedPage >= totalPages ? (
            <span className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 dark:border-slate-800 dark:text-slate-500">
              Next
            </span>
          ) : (
            <Link
              href={buildAttemptsHref(boundedPage + 1, statusParam, viewMode)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </Link>
          )}
        </div>
      </div>

      {attempts.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 dark:border-slate-700 dark:bg-slate-900/60">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <ClipboardList className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                No attempts yet
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Start your first mock exam from the library to build your
                attempt history.
              </p>
              <Link
                href="/library"
                className="mt-3 inline-flex text-sm font-medium text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-300"
              >
                Go to Exam Library
              </Link>
            </div>
          </div>
        </div>
      )}

      {viewMode === "chronological" && attempts.length > 0 && (
        <div className="grid gap-3">{attempts.map(renderAttemptCard)}</div>
      )}

      {viewMode === "grouped" && groups.length > 0 && (
        <div className="space-y-4">
          {groups.map((group) => (
            <section
              key={group.examId}
              className="rounded-2xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {group.examTitle}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {group.examSubject ?? "General"} • {group.attempts.length} on
                  this page
                </p>
              </div>
              <div className="grid gap-3">
                {group.attempts.map(renderAttemptCard)}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
