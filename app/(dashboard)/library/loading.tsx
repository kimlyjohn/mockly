import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </header>

      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-52" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="grid gap-3">
        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-8 w-96" />
                <Skeleton className="h-4 w-[42rem]" />
                <Skeleton className="h-4 w-[36rem]" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-44 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-3">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-[40rem]" />
            <Skeleton className="h-4 w-[34rem]" />
            <div className="flex gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
