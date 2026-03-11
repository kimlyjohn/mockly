import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { StartAttemptButton } from "@/components/dashboard/StartAttemptButton";
import { getExamDetails } from "@/lib/server/dashboard-data";

export const dynamic = "force-dynamic";

interface ExamPageProps {
  params: Promise<{ examId: string }>;
}

const fmt = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

export default async function ExamDetailPage({ params }: ExamPageProps) {
  const { examId } = await params;
  const exam = await getExamDetails(examId);

  if (!exam) {
    notFound();
  }

  const attemptBadgeVariant = (status: string) => {
    if (status === "IN_PROGRESS") return "secondary" as const;
    if (status === "SUBMITTED") return "default" as const;
    return "outline" as const;
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
          Exam Details
        </p>
        <h1 className="mt-2 text-3xl font-semibold">{exam.title}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {exam.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{exam.subject ?? "General"}</span>
          <span>{exam.totalQuestions} questions</span>
          <span>Passing {exam.passingScore}%</span>
          <span>Created {fmt(exam.createdAt)}</span>
        </div>
        <div className="mt-4">
          <StartAttemptButton examId={exam.id} />
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex lg:h-[56vh] lg:max-h-160 lg:flex-col dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Question Outline</h2>
          <ul className="mt-3 space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
            {exam.questions.map((question) => (
              <li
                key={question.id}
                className="text-sm text-slate-600 dark:text-slate-300"
              >
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {question.orderIndex + 1}.
                </span>{" "}
                {question.prompt}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex lg:h-[56vh] lg:max-h-160 lg:flex-col dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold">Attempt History</h2>
          <div className="mt-3 space-y-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-2">
            {exam.attempts.length === 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No attempts yet.
              </p>
            )}
            {exam.attempts.map((attempt) => (
              <Link
                key={attempt.id}
                href={`/attempts/${attempt.id}`}
                className="block rounded-xl border border-slate-200 p-3 text-sm transition hover:border-emerald-300 dark:border-slate-700 dark:hover:border-emerald-800"
              >
                <Badge variant={attemptBadgeVariant(attempt.status)}>
                  {attempt.status.replaceAll("_", " ")}
                </Badge>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {fmt(attempt.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
