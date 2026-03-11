import { Skeleton } from "@/components/ui/skeleton";

export default function AttemptDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header>
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-2 h-4 w-96" />
      </header>

      <div className="rounded-xl border border-border bg-card p-3">
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <Skeleton className="h-8 w-104" />
            <Skeleton className="mt-2 h-4 w-40" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-28 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-2 w-full rounded-full" />
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <Skeleton className="h-7 w-[60%]" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
              <Skeleton className="h-9 w-32 rounded-xl" />
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
