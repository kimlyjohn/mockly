import Link from "next/link";
import { FileUp } from "lucide-react";

import { ExamLibraryItemMenu } from "@/components/dashboard/ExamLibraryItemMenu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
            <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl dark:text-slate-100">
              Exam Library
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-slate-600 sm:text-sm dark:text-slate-300">
              Browse and manage reusable exams. Start attempts from any saved
              exam.
            </p>
          </div>
          <Link
            href="/library/import"
            className={buttonVariants({ size: "sm" })}
          >
            <FileUp className="h-4 w-4" />
            Import Exams
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500 dark:text-slate-400">
        <p className="shrink-0">
          Showing page {boundedPage} of {totalPages} ({total} exams)
        </p>

        {totalPages > 1 && (
          <div className="flex-1 overflow-x-auto pb-2 sm:pb-0">
            <Pagination className="justify-start sm:justify-end">
              <PaginationContent className="justify-start gap-1 sm:justify-end">
                <PaginationItem>
                  {currentPage <= 1 ? (
                    <PaginationPrevious
                      href="#"
                      className="pointer-events-none opacity-50 cursor-not-allowed"
                    />
                  ) : (
                    <PaginationPrevious
                      href={`/library?page=${currentPage - 1}`}
                    />
                  )}
                </PaginationItem>

                {pageItems.map((item, index) => (
                  <PaginationItem
                    key={item === "ellipsis" ? `ellipsis-${index}` : item}
                  >
                    {item === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href={`/library?page=${item}`}
                        isActive={item === boundedPage}
                        className={
                          item === boundedPage
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-900/40 dark:text-emerald-100 dark:hover:bg-emerald-900/60"
                            : ""
                        }
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  {currentPage >= totalPages ? (
                    <PaginationNext
                      href="#"
                      className="pointer-events-none opacity-50 cursor-not-allowed"
                    />
                  ) : (
                    <PaginationNext href={`/library?page=${currentPage + 1}`} />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <div className="grid gap-3">
        {exams.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            No exams yet. Open the import page to add your first JSON exam.
          </div>
        )}

        {exams.map((exam) => (
          <article
            key={exam.id}
            className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-800"
          >
            <Link
              href={`/library/${exam.id}`}
              aria-label={`Open ${exam.title}`}
              className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
            />

            <div className="pointer-events-none relative z-20 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  <span className="line-clamp-2 wrap-break-word">
                    {exam.title}
                  </span>
                </h2>
                <p className="mt-1 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                  {exam.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Badge
                    variant="outline"
                    className="max-w-60 truncate px-2 py-0 text-[10px] uppercase tracking-[0.08em]"
                    title={exam.subject ?? "General"}
                  >
                    {exam.subject ?? "General"}
                  </Badge>
                  <span>{exam.totalQuestions} questions</span>
                  <span>Passing {exam.passingScore}%</span>
                  <span>{exam._count.attempts} attempts</span>
                  <span>Updated {fmt(exam.updatedAt)}</span>
                </div>
              </div>

              <div className="pointer-events-auto relative z-30 ml-auto flex shrink-0 items-start gap-2 self-start">
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
