"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, logAudit } from "@/lib/auth";
import { syncReachedTargets } from "@/lib/calc";
import { parseAmount, parseAge, normName } from "@/lib/validate";
import type { ActionResult } from "@/lib/types";

export async function createDonation(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();

  const amount = parseAmount(formData.get("amount"));
  const date = new Date(String(formData.get("date") || ""));
  if (amount === null) return { error: "Маблағ нодуруст аст" };
  if (isNaN(date.getTime())) return { error: "Санаро ворид кунед" };

  const note = String(formData.get("note") || "").trim() || null;
  const accountId = String(formData.get("accountId") || "") || null;
  const isAnonymous = formData.get("isAnonymous") === "on";

  const firstName = String(formData.get("firstName") || "").replace(/\s+/g, " ").trim() || null;
  const familyName = String(formData.get("familyName") || "").replace(/\s+/g, " ").trim() || null;
  const age = parseAge(formData.get("age"));

  // Resolve / group donor (case- and whitespace-insensitive, null-aware)
  let donorId: string | null = null;
  if (isAnonymous) {
    const anon = await prisma.donor.create({ data: { isAnonymous: true } });
    donorId = anon.id;
  } else if (firstName || familyName) {
    const nf = normName(firstName);
    const nl = normName(familyName);
    const candidates = await prisma.donor.findMany({ where: { isAnonymous: false } });
    const existing = candidates.find(
      (c) => normName(c.firstName) === nf && normName(c.familyName) === nl
    );
    if (existing) {
      donorId = existing.id;
      if (age != null && existing.age == null) {
        await prisma.donor.update({ where: { id: existing.id }, data: { age } });
      }
    } else {
      const created = await prisma.donor.create({ data: { firstName, familyName, age } });
      donorId = created.id;
    }
  }

  const don = await prisma.donation.create({
    data: { amount, date, note, donorId, accountId },
  });
  await logAudit(admin.id, "create", "donation", don.id, String(amount));

  // Persist + audit any target newly reached by this donation (write path only)
  const newlyReached = await syncReachedTargets();
  for (const tg of newlyReached) {
    await logAudit(admin.id, "update", "target", tg.id, `${tg.title} — иҷро шуд`);
  }

  revalidatePath("/donations");
  revalidatePath("/");
  revalidatePath("/targets");
  return { ok: true };
}

export async function deleteDonation(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");

  const existing = await prisma.donation.findUnique({ where: { id }, select: { donorId: true } });
  if (!existing) return { error: "Сабт ёфт нашуд" };

  await prisma.donation.delete({ where: { id } });

  // Clean up a donor left with no donations (incl. anonymous one-offs)
  if (existing.donorId) {
    const remaining = await prisma.donation.count({ where: { donorId: existing.donorId } });
    if (remaining === 0) {
      await prisma.donor.delete({ where: { id: existing.donorId } }).catch(() => {});
    }
  }

  await logAudit(admin.id, "delete", "donation", id);
  revalidatePath("/donations");
  revalidatePath("/");
  revalidatePath("/targets");
  return { ok: true };
}
