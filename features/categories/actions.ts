"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";
import { createCategorySchema, type CreateCategoryInput } from "./schemas";

export async function listCategoriesAction() {
  return db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { questions: true } } },
  });
}

export async function createCategoryAction(input: CreateCategoryInput) {
  await requirePermission("categories:write");
  const parsed = createCategorySchema.parse(input);
  const category = await db.category.create({ data: parsed });
  revalidatePath("/");
  revalidatePath("/quiz/setup");
  return category;
}

export async function deleteCategoryAction(categoryId: string) {
  await requirePermission("categories:write");
  await db.category.delete({ where: { id: categoryId } });
  revalidatePath("/");
  revalidatePath("/quiz/setup");
}
