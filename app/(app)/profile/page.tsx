import { getMyProfileAction } from "@/features/profile/actions";
import { MedalBadges } from "@/features/gamification/components/medal-badges";

export default async function ProfilePage() {
  const { profile, user, role } = await getMyProfileAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="text-sm text-muted-foreground">
          {user.email} · {role}
        </p>
      </div>

      <MedalBadges
        bronze={profile.medalsBronze}
        silver={profile.medalsSilver}
        gold={profile.medalsGold}
      />

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border p-3">
          <dt className="text-muted-foreground">Best streak</dt>
          <dd className="text-lg font-semibold">{profile.bestStreak}</dd>
        </div>
        <div className="rounded-xl border p-3">
          <dt className="text-muted-foreground">Total points</dt>
          <dd className="text-lg font-semibold">{profile.totalPoints}</dd>
        </div>
      </dl>
    </div>
  );
}
