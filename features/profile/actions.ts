"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireProfile, requireSession, resolveRole } from "@/lib/session";
import { updateProfileSchema, type UpdateProfileInput } from "./schemas";

export async function getMyProfileAction() {
  const session = await requireSession();
  const profile = await requireProfile();
  return { profile, user: session.user, role: resolveRole(session.user) };
}

export async function updateProfileAction(input: UpdateProfileInput) {
  const profile = await requireProfile();
  const parsed = updateProfileSchema.parse(input);
  const updated = await db.profile.update({
    where: { id: profile.id },
    data: parsed,
  });
  revalidatePath("/profile");
  return updated;
}
