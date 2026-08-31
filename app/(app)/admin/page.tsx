import { requirePermission } from "@/lib/session";
import { db } from "@/lib/db";

export default async function AdminPage() {
  await requirePermission("categories:write");

  const [questionCount, categoryCount] = await Promise.all([
    db.question.count(),
    db.category.count(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Admin</h1>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border p-3">
          <p className="text-muted-foreground">Questions</p>
          <p className="text-lg font-semibold">{questionCount}</p>
        </div>
        <div className="rounded-xl border p-3">
          <p className="text-muted-foreground">Categories</p>
          <p className="text-lg font-semibold">{categoryCount}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Question/category CRUD, Excel import, and AI question generation are the
        next build phase — see docs/multi-domain-playbook.md.
      </p>
    </div>
  );
}
