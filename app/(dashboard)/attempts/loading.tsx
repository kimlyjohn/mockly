import { Skeleton } from "@/components/ui/skeleton";

export default function AttemptsLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header className="rounded-2xl border border-emerald-100/70 bg-linear-to-r from-emerald-50/80 via-cyan-50/60 to-slate-50/70 p-4 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-cyan-950/20 dark:to-slate-900/40">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="mt-2 h-4 w-96" />
      </header>

      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <article
            key={index}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-8 w-80" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-40" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
