"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth";
import { parseAmount } from "@/lib/validate";
import type { ActionResult } from "@/lib/types";

export async function createExpense(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();

  const amount = parseAmount(formData.get("amount"));
  const date = new Date(String(formData.get("date") || ""));
  const accountId = String(formData.get("accountId") || "");
  const category = String(formData.get("category") || "").trim() || null;
  const payee = String(formData.get("payee") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;

  if (amount === null) return { error: "Маблағ нодуруст аст" };
  if (isNaN(date.getTime())) return { error: "Санаро ворид кунед" };
  if (!accountId) return { error: "Ҳисобро интихоб кунед (ҳатмӣ)" };

  const exp = await prisma.expense.create({
    data: { amount, date, accountId, category, payee, note },
  });
  await logAudit(admin.id, "create", "expense", exp.id, `${amount} ${category ?? ""}`.trim());
  revalidatePath("/expenses");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteExpense(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  try {
    await prisma.expense.delete({ where: { id } });
  } catch {
    return { error: "Сабт ёфт нашуд" };
  }
  await logAudit(admin.id, "delete", "expense", id);
  revalidatePath("/expenses");
  revalidatePath("/");
  return { ok: true };
}
