"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth";
import { parseAmount, parseNonNegative, normName } from "@/lib/validate";
import type { ActionResult } from "@/lib/types";

export async function createAccount(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const name = String(formData.get("name") || "").replace(/\s+/g, " ").trim();
  const type = String(formData.get("type") || "bank");
  const openingBalance = parseNonNegative(formData.get("openingBalance"));
  if (!name) return { error: "Номи ҳисобро ворид кунед" };
  if (openingBalance === null) return { error: "Бақияи аввалия нодуруст аст" };

  // Reject duplicate names (case/whitespace-insensitive) for a clean dropdown
  const all = await prisma.account.findMany({ select: { name: true } });
  if (all.some((a) => normName(a.name) === normName(name))) {
    return { error: "Ҳисоб бо ин ном аллакай мавҷуд аст" };
  }

  const acc = await prisma.account.create({ data: { name, type, openingBalance } });
  await logAudit(admin.id, "create", "account", acc.id, `${name} (${type})`);
  revalidatePath("/accounts");
  revalidatePath("/");
  return { ok: true };
}

export async function createTransfer(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const fromAccountId = String(formData.get("fromAccountId") || "");
  const toAccountId = String(formData.get("toAccountId") || "");
  const amount = parseAmount(formData.get("amount"));
  const date = new Date(String(formData.get("date") || ""));
  const note = String(formData.get("note") || "").trim() || null;

  if (!fromAccountId || !toAccountId) return { error: "Ҳисобҳоро интихоб кунед" };
  if (fromAccountId === toAccountId) return { error: "Ҳисобҳо бояд гуногун бошанд" };
  if (amount === null) return { error: "Маблағ нодуруст аст" };
  if (isNaN(date.getTime())) return { error: "Санаро ворид кунед" };

  // Make sure both accounts exist (friendly error instead of a raw FK crash)
  const n = await prisma.account.count({ where: { id: { in: [fromAccountId, toAccountId] } } });
  if (n < 2) return { error: "Ҳисоб ёфт нашуд" };

  const tr = await prisma.transfer.create({
    data: { fromAccountId, toAccountId, amount, date, note },
  });
  await logAudit(admin.id, "transfer", "transfer", tr.id, `${amount}`);
  revalidatePath("/accounts");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteAccount(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
  const counts = await prisma.$transaction([
    prisma.donation.count({ where: { accountId: id } }),
    prisma.expense.count({ where: { accountId: id } }),
    prisma.transfer.count({ where: { OR: [{ fromAccountId: id }, { toAccountId: id }] } }),
  ]);
  if (counts.some((c) => c > 0)) {
    return { error: "Ин ҳисоб амалиёт дорад ва нест карда намешавад" };
  }
  try {
    await prisma.account.delete({ where: { id } });
  } catch {
    return { error: "Ин ҳисоб амалиёт дорад ва нест карда намешавад" };
  }
  await logAudit(admin.id, "delete", "account", id);
  revalidatePath("/accounts");
  revalidatePath("/");
  return { ok: true };
}
