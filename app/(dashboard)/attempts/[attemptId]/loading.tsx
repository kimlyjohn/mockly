import { Skeleton } from "@/components/ui/skeleton";

export default function AttemptDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header className="rounded-2xl border border-emerald-100/70 bg-linear-to-r from-emerald-50/80 via-cyan-50/60 to-slate-50/70 p-4 sm:p-6 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-cyan-950/20 dark:to-slate-900/40">
        <Skeleton className="h-8 w-64 sm:h-10 sm:w-80" />
        <Skeleton className="mt-2 h-3.5 w-full max-w-lg sm:h-4" />
      </header>

      <div className="rounded-xl border border-slate-200 bg-white/60 p-3 sm:px-4 dark:border-slate-800 dark:bg-slate-900/40">
        <Skeleton className="h-6 w-32 sm:h-8 sm:w-48" />
      </div>

      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/90">
            <Skeleton className="h-6 w-[80%] sm:h-8" />
            <Skeleton className="mt-2 h-4 w-40" />
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
              <Skeleton className="h-10 w-28 rounded-xl sm:h-12 sm:w-36" />
              <Skeleton className="h-10 w-32 rounded-xl sm:h-12 sm:w-40" />
            </div>
            <Skeleton className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900/90">
            <Skeleton className="h-6 w-[60%] sm:h-7" />
            <div className="mt-5 space-y-3">
              <Skeleton className="h-12 w-full rounded-xl sm:h-14" />
              <Skeleton className="h-12 w-full rounded-xl sm:h-14" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-xl" />
            </div>
          </div>
        </div>

        <aside className="rounded-2xl border border-border bg-card p-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-2 h-3 w-40" />
          <div className="mt-3 grid grid-cols-5 gap-2">
            {Array.from({ length: 15 }).map((_, index) => (
              <Skeleton key={index} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
