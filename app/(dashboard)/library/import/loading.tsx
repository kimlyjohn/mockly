import { Skeleton } from "@/components/ui/skeleton";

export default function ImportLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 sm:h-10 sm:w-64" />
          <Skeleton className="h-4 w-full max-w-xs sm:max-w-2xl" />
        </div>
        <Skeleton className="h-9 w-28 rounded-xl sm:h-10 sm:w-36" />
      </header>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-7 w-40 sm:w-52" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-36 rounded-xl sm:w-44" />
          <Skeleton className="h-9 w-40 rounded-xl sm:w-52" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
          <Skeleton className="h-4 w-36 sm:w-48" />
          <Skeleton className="mt-2 h-72 w-full rounded-xl" />
          <div className="mt-2 flex justify-end">
            <Skeleton className="h-9 w-36 rounded-xl sm:w-44" />
          </div>
        </div>
      </div>
    </section>
  );
}
