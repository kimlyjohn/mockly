import Link from "next/link";

import { ExamLibraryItemMenu } from "@/components/dashboard/ExamLibraryItemMenu";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/Button";
import { listExamsPaginated } from "@/lib/server/dashboard-data";

export const dynamic = "force-dynamic";

const fmt = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

interface LibraryPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { page } = await searchParams;
  const parsedPage = Number.parseInt(page ?? "1", 10);
  const currentPage = Number.isFinite(parsedPage) ? parsedPage : 1;
  const {
    items: exams,
    totalPages,
    total,
  } = await listExamsPaginated(currentPage, 5);

  const boundedPage = Math.min(Math.max(1, currentPage), totalPages);
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

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Exam Library
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Browse and manage reusable exams. Start attempts from any saved
              exam.
            </p>
          </div>
          <Link href="/library/import" className={buttonVariants()}>
            Import Exams
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <p>
          Showing page {boundedPage} of {totalPages} ({total} exams)
        </p>
        <div className="flex items-center gap-2">
          {currentPage <= 1 ? (
            <span className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 dark:border-slate-800 dark:text-slate-500">
              Previous
            </span>
          ) : (
            <Link
              href={`/library?page=${currentPage - 1}`}
              className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </Link>
          )}
          {currentPage >= totalPages ? (
            <span className="rounded-lg border border-slate-200 px-3 py-1 text-slate-400 dark:border-slate-800 dark:text-slate-500">
              Next
            </span>
          ) : (
            <Link
              href={`/library?page=${currentPage + 1}`}
              className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </Link>
          )}

          <div className="ml-1 flex items-center gap-1">
            {pageItems.map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis_${index}`}
                    className="px-1 text-slate-400 dark:text-slate-500"
                  >
                    ...
                  </span>
                );
              }

              const active = item === boundedPage;
              return (
                <Link
                  key={item}
                  href={`/library?page=${item}`}
                  className={
                    active
                      ? "rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "rounded-lg border border-slate-300 px-3 py-1 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  }
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {exams.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No exams yet. Open the import page to add your first JSON exam.
          </p>
        )}

        {exams.map((exam) => (
          <article
            key={exam.id}
            className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
          >
            <Link
              href={`/library/${exam.id}`}
              aria-label={`Open ${exam.title}`}
              className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
            />

            <div className="pointer-events-none relative z-20 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {exam.title}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {exam.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{exam.totalQuestions} questions</span>
                  <span>Passing {exam.passingScore}%</span>
                  <span>{exam._count.attempts} attempts</span>
                  <span>Updated {fmt(exam.updatedAt)}</span>
                </div>
              </div>

              <div className="pointer-events-auto relative z-30 flex items-start gap-2">
                <Badge variant="outline">{exam.subject ?? "General"}</Badge>
                <ExamLibraryItemMenu
                  examId={exam.id}
                  title={exam.title}
                  description={exam.description}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
