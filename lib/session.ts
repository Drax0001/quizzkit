import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { domain } from "@/config/domain.config";

// Cached per-request: the root (app) layout and the page it wraps both
// need the session, and this avoids hitting Better Auth's session lookup
// twice for the same request.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

/** Ensures a Profile row exists for the signed-in user and returns it. */
export async function requireProfile() {
  const session = await requireSession();
  const existing = await db.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) return existing;
  return db.profile.create({
    data: {
      userId: session.user.id,
      // Json fields carry no schema default on SQLite — see schema.prisma.
      metadata: {},
      answeredQuestionIds: [],
      favoriteCategoryIds: [],
    },
  });
}

/**
 * `domain.owners` (config/domain.config.ts) replaces the hardcoded
 * superadmin email the original app had copy-pasted into five files — an
 * owner is always superadmin here, regardless of what the `role` column
 * says, so a new fork never ships locked out of its own instance.
 */
export function resolveRole(user: { email: string; role?: string | null }) {
  if (domain.owners.includes(user.email)) return "superadmin" as const;
  return (user.role ?? "user") as "user" | "admin" | "superadmin";
}

// Permission map — check permissions at the call site, not roles, so the
// role hierarchy can change without touching every guard. See
// docs/multi-domain-playbook.md.
const PERMISSIONS = {
  user: [] as const,
  admin: ["questions:write", "categories:write", "resources:write"] as const,
  superadmin: [
    "questions:write",
    "categories:write",
    "resources:write",
    "users:write",
    "roles:write",
  ] as const,
};

export type Permission = (typeof PERMISSIONS)["superadmin"][number];

export function hasPermission(
  role: ReturnType<typeof resolveRole>,
  permission: Permission,
): boolean {
  return (PERMISSIONS[role] as readonly string[]).includes(permission);
}

export async function requirePermission(permission: Permission) {
  const session = await requireSession();
  const role = resolveRole(session.user);
  if (!hasPermission(role, permission)) {
    redirect("/");
  }
  return { session, role };
}
