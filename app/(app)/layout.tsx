import { BottomNav } from "@/components/bottom-nav";
import { getSession, resolveRole } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Resolved server-side so the admin nav item is never sent to the client
  // for a non-admin — no flash of a button that then hides itself.
  const session = await getSession();
  const role = session ? resolveRole(session.user) : "user";
  const isAdmin = role === "admin" || role === "superadmin";

  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="mx-auto max-w-lg px-4 pt-8">{children}</main>
      <BottomNav isAdmin={isAdmin} />
    </div>
  );
}
