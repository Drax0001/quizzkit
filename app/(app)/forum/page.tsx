import { notFound } from "next/navigation";
import { domain } from "@/config/domain.config";
import { requireSession } from "@/lib/session";

export default async function ForumPage() {
  await requireSession();
  if (!domain.features.forum) notFound();

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold">Forum</h1>
      <p className="text-sm text-muted-foreground">
        Optional module — flip `features.forum` in domain.config.ts to hide this
        route entirely, or build it out. See docs/multi-domain-playbook.md.
      </p>
    </div>
  );
}
