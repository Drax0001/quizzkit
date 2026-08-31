export function MedalBadges({
  bronze,
  silver,
  gold,
}: {
  bronze: number;
  silver: number;
  gold: number;
}) {
  return (
    <div className="flex gap-4 rounded-xl border bg-card p-3 text-sm">
      <span>🥇 {gold}</span>
      <span>🥈 {silver}</span>
      <span>🥉 {bronze}</span>
    </div>
  );
}
