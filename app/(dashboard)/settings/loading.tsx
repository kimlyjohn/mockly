import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-5">
      <header>
        <Skeleton className="h-10 w-40" />
        <Skeleton className="mt-2 h-4 w-96" />
      </header>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <Skeleton className="h-8 w-32" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-5 w-52" />
        <Skeleton className="h-9 w-32 rounded-xl" />
        <div className="border-t border-border pt-3">
          <Skeleton className="h-4 w-20" />
          <div className="mt-3 flex gap-3">
            <Skeleton className="h-9 w-36 rounded-xl" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
