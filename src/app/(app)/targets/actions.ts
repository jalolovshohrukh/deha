"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth";
import { parseAmount } from "@/lib/validate";
import type { ActionResult } from "@/lib/types";

export async function createTarget(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const amount = parseAmount(formData.get("amount"));
  if (!title) return { error: "Номи ҳадафро ворид кунед" };
  if (amount === null) return { error: "Маблағ нодуруст аст" };

  const max = await prisma.target.aggregate({ _max: { sequence: true } });
  const sequence = (max._max.sequence ?? 0) + 1;

  const tg = await prisma.target.create({ data: { title, amount, sequence } });
  await logAudit(admin.id, "create", "target", tg.id, `${title} (${amount})`);
  revalidatePath("/targets");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteTarget(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  try {
    await prisma.target.delete({ where: { id } });
  } catch {
    return { error: "Сабт ёфт нашуд" };
  }
  await logAudit(admin.id, "delete", "target", id);
  revalidatePath("/targets");
  revalidatePath("/");
  return { ok: true };
}
