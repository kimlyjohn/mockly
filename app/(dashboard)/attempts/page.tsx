import Link from "next/link";
import { ClipboardList, Clock3 } from "lucide-react";

import { AttemptItemMenu } from "@/components/dashboard/AttemptItemMenu";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
  const pageItems: Array<number | "ellipsis"> = [];

  if (totalPages <= 7) {
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
      pageItems.push(pageNumber);
    }
  } else {
    const start = Math.max(2, boundedPage - 1);
    const end = Math.min(totalPages - 1, boundedPage + 1);

    pageItems.push(1);
    if (start > 2) {
      pageItems.push("ellipsis");
    }
    for (let pageNumber = start; pageNumber <= end; pageNumber += 1) {
      pageItems.push(pageNumber);
    }
    if (end < totalPages - 1) {
      pageItems.push("ellipsis");
    }
    pageItems.push(totalPages);
  }

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

  const renderAttemptCard = (
    attempt: (typeof attempts)[number],
    options?: { hideExamDetails?: boolean; compact?: boolean },
  ) => {
    const hideExamDetails = options?.hideExamDetails ?? false;
    const compact = options?.compact ?? false;
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
        className={`group relative rounded-2xl border border-slate-200 bg-white/96 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/96 dark:hover:border-emerald-800 ${compact ? "p-3 sm:p-3.5" : "p-4 sm:p-5"}`}
      >
        <Link
          href={`/attempts/${attempt.id}`}
          aria-label={`Open attempt for ${attempt.examTitle}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
        />

        {!compact && (
          <div className="pointer-events-none relative z-20 flex flex-wrap items-start justify-between gap-3">
            {!hideExamDetails && (
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">
                  {attempt.examTitle}
                </p>
                <p className="truncate text-xs text-slate-600 sm:text-sm dark:text-slate-300">
                  {attempt.examSubject ?? "General"}
                </p>
              </div>
            )}

            <div className="pointer-events-auto relative z-30 ml-auto flex items-start gap-1.5 sm:gap-2">
              <Badge variant={statusVariant(attempt.status)}>
                {statusLabel(attempt.status)}
              </Badge>
              <AttemptItemMenu
                attemptId={attempt.id}
                examTitle={attempt.examTitle}
              />
            </div>
          </div>
        )}

        {compact && (
          <div className="pointer-events-none relative z-20 mb-1 flex items-start justify-end">
            <div className="pointer-events-auto relative z-30 flex items-start gap-1.5 sm:gap-2">
              <Badge variant={statusVariant(attempt.status)}>
                {statusLabel(attempt.status)}
              </Badge>
              <AttemptItemMenu
                attemptId={attempt.id}
                examTitle={attempt.examTitle}
              />
            </div>
          </div>
        )}

        {isSubmitted && (
          <div
            className={`flex flex-wrap items-center text-xs ${compact ? "mt-1 gap-1.5" : "mt-3 gap-2"}`}
          >
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
          <div
            className={`flex flex-wrap items-center text-xs ${compact ? "mt-1 gap-1.5" : "mt-3 gap-2"}`}
          >
            <Badge variant="secondary">
              Question {attempt.currentQuestionIndex + 1}
            </Badge>
            <Badge variant="outline">
              <Clock3 className="h-3 w-3" />
              {fmtDuration(attempt.elapsedSeconds)}
            </Badge>
          </div>
        )}

        <div
          className={`flex flex-wrap text-xs text-slate-500 dark:text-slate-400 ${compact ? "mt-1.5 gap-x-2 gap-y-1" : "mt-3 gap-2"}`}
        >
          <span>{attempt.answersCount} answers</span>
          <span>{attempt.flagsCount} flags</span>
          <span>Updated {fmt(attempt.updatedAt)}</span>
        </div>
      </article>
    );
  };

  return (
    <section className="space-y-0">
      <div className="mx-auto w-full max-w-6xl pb-4">
        <header className="rounded-2xl border border-emerald-100/70 bg-linear-to-r from-emerald-50/80 via-cyan-50/60 to-slate-50/70 p-4 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-cyan-950/20 dark:to-slate-900/40">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
            Attempts
          </h1>
          <p className="mt-1 max-w-2xl text-xs text-slate-600 sm:text-sm dark:text-slate-300">
            Browse attempt history across your exams with quick filters and
            pages.
          </p>
        </header>
      </div>

      <div className="sticky top-0 z-50 -mx-4 border-y border-slate-200/70 bg-white sm:-mx-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-8">
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
                      ? "rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800 sm:px-3 sm:text-xs dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100 sm:px-3 sm:text-xs dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
                  ? "rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800 sm:px-3 sm:text-xs dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100 sm:px-3 sm:text-xs dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              }
            >
              Chronological
            </Link>
            <Link
              href={buildAttemptsHref(1, statusParam, "grouped")}
              className={
                viewMode === "grouped"
                  ? "rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-800 sm:px-3 sm:text-xs dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "rounded-lg border border-slate-300 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100 sm:px-3 sm:text-xs dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              }
            >
              Group by Exam
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl space-y-4 pt-4">
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
          <div className="grid gap-3">
            {attempts.map((attempt) => renderAttemptCard(attempt))}
          </div>
        )}

        {viewMode === "grouped" && groups.length > 0 && (
          <div className="space-y-6 sm:space-y-8">
            {groups.map((group) => (
              <section key={group.examId} className="space-y-3">
                <header className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5 dark:border-slate-800/80 dark:bg-slate-900/40">
                  <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-slate-100">
                    <span className="line-clamp-1">{group.examTitle}</span>
                  </h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {group.examSubject ?? "General"} • {group.attempts.length}{" "}
                    attempt{group.attempts.length === 1 ? "" : "s"} shown
                  </p>
                </header>
                <div className="grid gap-2 sm:gap-3">
                  {group.attempts.map((attempt) =>
                    renderAttemptCard(attempt, {
                      hideExamDetails: true,
                      compact: true,
                    }),
                  )}
                </div>
              </section>
            ))}
          </div>
        )}

        {attempts.length > 0 && (
          <div className="mt-6 space-y-2 pb-1">
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              Page {boundedPage} of {totalPages} ({total} attempts)
            </p>

            <Pagination className="justify-start border-t border-slate-200 pt-2 sm:justify-end dark:border-slate-800">
              <PaginationContent className="justify-start gap-1 sm:justify-end">
                <PaginationItem>
                  {boundedPage <= 1 ? (
                    <span className="inline-flex h-9 cursor-not-allowed items-center justify-center px-4 py-2 text-sm font-medium text-slate-400 opacity-50 dark:text-slate-500">
                      Previous
                    </span>
                  ) : (
                    <PaginationPrevious
                      href={buildAttemptsHref(
                        boundedPage - 1,
                        statusParam,
                        viewMode,
                      )}
                    />
                  )}
                </PaginationItem>

                {pageItems.map((item, index) => (
                  <PaginationItem
                    key={item === "ellipsis" ? `ellipsis_${index}` : item}
                  >
                    {item === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href={buildAttemptsHref(item, statusParam, viewMode)}
                        isActive={item === boundedPage}
                        className={
                          item === boundedPage
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50"
                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        }
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  {boundedPage >= totalPages ? (
                    <span className="inline-flex h-9 cursor-not-allowed items-center justify-center px-4 py-2 text-sm font-medium text-slate-400 opacity-50 dark:text-slate-500">
                      Next
                    </span>
                  ) : (
                    <PaginationNext
                      href={buildAttemptsHref(
                        boundedPage + 1,
                        statusParam,
                        viewMode,
                      )}
                    />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </section>
  );
}
