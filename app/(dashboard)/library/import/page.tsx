import Link from "next/link";

import { ExamImportPanel } from "@/components/dashboard/ExamImportPanel";

export const dynamic = "force-dynamic";

export default function ImportExamPage() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Import Exams
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Upload or paste exam JSON. After a successful import, you will be
            redirected to that exam details page.
          </p>
        </div>
        <Link
          href="/library"
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Back To Library
        </Link>
      </header>

      <ExamImportPanel />
    </section>
  );
}
