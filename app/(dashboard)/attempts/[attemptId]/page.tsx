import { AttemptRunner } from "@/components/dashboard/AttemptRunner";

export const dynamic = "force-dynamic";

interface AttemptPageProps {
  params: Promise<{ attemptId: string }>;
}
export default async function AttemptPage({ params }: AttemptPageProps) {
  const { attemptId } = await params;

  return (
    <section className="mx-auto w-full max-w-6xl space-y-5">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Attempt Session
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Resume your attempt with autosave and submit when ready.
        </p>
      </header>

      <AttemptRunner attemptId={attemptId} />
    </section>
  );
}
