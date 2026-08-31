import { notFound } from "next/navigation";
import { domain } from "@/config/domain.config";
import { requireSession } from "@/lib/session";

export default async function DuelPage() {
  await requireSession();
  if (!domain.features.duels) notFound();

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-bold">Duel</h1>
      <p className="text-sm text-muted-foreground">
        Optional module, flagged on for this instance but not built yet — see
        the feature module map in docs/multi-domain-playbook.md.
      </p>
    </div>
  );
}
