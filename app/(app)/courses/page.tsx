import { notFound } from "next/navigation";
import { domain } from "@/config/domain.config";
import { requireSession } from "@/lib/session";

export default async function CoursesPage() {
  await requireSession();
  if (!domain.features.courses) notFound();

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold">Courses</h1>
      <p className="text-sm text-muted-foreground">
        Optional resource-library module — not built yet. See
        docs/multi-domain-playbook.md.
      </p>
    </div>
  );
}
