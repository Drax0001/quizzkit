import { listCategoriesAction } from "@/features/categories/actions";
import { QuizSetupForm } from "@/features/quiz/components/quiz-setup-form";

export default async function QuizSetupPage({
  searchParams,
}: PageProps<"/quiz/setup">) {
  const params = await searchParams;
  const categoriesRaw = await listCategoriesAction();
  const categories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    questionCount: c._count.questions,
  }));
  const defaultCategoryId =
    typeof params.categoryId === "string" ? params.categoryId : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">New quiz</h1>
        <p className="text-sm text-muted-foreground">Configure your session.</p>
      </div>
      <QuizSetupForm
        categories={categories}
        defaultCategoryId={defaultCategoryId}
      />
    </div>
  );
}
