import { AttemptRunner } from "@/components/dashboard/AttemptRunner";

export const dynamic = "force-dynamic";

interface AttemptPageProps {
  params: Promise<{ attemptId: string }>;
}
export default async function AttemptPage({ params }: AttemptPageProps) {
  const { attemptId } = await params;

  return (
    <section>
      <AttemptRunner attemptId={attemptId} />
    </section>
  );
}
