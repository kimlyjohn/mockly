import { Skeleton } from "@/components/ui/skeleton";

export default function ExamDetailLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-3 h-10 w-[34rem]" />
        <Skeleton className="mt-3 h-4 w-[44rem]" />
        <Skeleton className="mt-2 h-4 w-[36rem]" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="mt-4 h-9 w-40 rounded-xl" />
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <Skeleton className="h-7 w-40" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[86%]" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[88%]" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <Skeleton className="h-7 w-36" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>
      </section>
    </section>
  );
}
