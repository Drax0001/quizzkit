import Link from "next/link";
import { listCategoriesAction } from "@/features/categories/actions";
import { getMyProfileAction } from "@/features/profile/actions";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { domain } from "@/config/domain.config";

export default async function HomePage() {
  const [{ profile, user }, categories, totalQuestions] = await Promise.all([
    getMyProfileAction(),
    listCategoriesAction(),
    db.question.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">
            Hi, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            {domain.brand.tagline}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xl font-bold">{totalQuestions}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xl font-bold">{profile.totalQuizzes}</p>
            <p className="text-xs text-muted-foreground">Quizzes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xl font-bold">{profile.totalPoints}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </CardContent>
        </Card>
      </div>

      <Button asChild size="lg" className="w-full">
        <Link href="/quiz/setup">Start a quiz</Link>
      </Button>

      <div>
        <h2 className="mb-3 text-sm font-semibold">
          {domain.taxonomySeed.length > 0 ? "Categories" : "No categories yet"}
        </h2>
        <div className="space-y-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/quiz/setup?categoryId=${c.id}`}
              className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-sm transition-colors hover:border-primary/40"
            >
              <span>
                {c.icon ? `${c.icon} ` : ""}
                {c.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {c._count.questions}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
