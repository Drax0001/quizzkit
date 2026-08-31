import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireProfile } from "@/lib/session";
import { Button } from "@/components/ui/button";

export default async function ResultsPage({
  params,
}: PageProps<"/results/[attemptId]">) {
  const { attemptId } = await params;
  const profile = await requireProfile();
  const attempt = await db.attempt.findUnique({ where: { id: attemptId } });

  if (!attempt || attempt.profileId !== profile.id) notFound();

  return (
    <div className="space-y-8 pt-8 text-center">
      <div>
        <p className="text-sm text-muted-foreground">Your score</p>
        <p className="text-6xl font-bold text-primary">{attempt.percentage}%</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {attempt.score} / {attempt.total} correct
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">Home</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href="/quiz/setup">Play again</Link>
        </Button>
      </div>
    </div>
  );
}
