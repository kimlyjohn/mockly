import { Skeleton } from "@/components/ui/skeleton";

export default function ImportLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-[38rem]" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </header>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-7 w-52" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-44 rounded-xl" />
          <Skeleton className="h-9 w-52 rounded-xl" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-2 h-72 w-full rounded-xl" />
          <div className="mt-2 flex justify-end">
            <Skeleton className="h-9 w-44 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
