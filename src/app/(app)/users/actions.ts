"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult } from "@/lib/types";

export async function createUser(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const username = String(formData.get("username") || "").trim().toLowerCase();
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "viewer");

  if (!username) return { error: "Логинро ворид кунед" };
  if (!name) return { error: "Номро ворид кунед" };
  if (password.length < 4) return { error: "Рамз хеле кӯтоҳ аст (ҳадди ақал 4 аломат)" };
  if (role !== "admin" && role !== "viewer") return { error: "Нақш нодуруст аст" };

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Ин логин аллакай мавҷуд аст" };

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { username, name, password: hashed, role } });

  revalidatePath("/users");
  return { ok: true };
}

export async function updateUser(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const role = String(formData.get("role") || "viewer");
  const password = String(formData.get("password") || ""); // optional — only set if provided

  if (!name) return { error: "Номро ворид кунед" };
  if (role !== "admin" && role !== "viewer") return { error: "Нақш нодуруст аст" };

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { error: "Корбар ёфт нашуд" };

  // never demote the last admin
  if (target.role === "admin" && role !== "admin") {
    const admins = await prisma.user.count({ where: { role: "admin" } });
    if (admins <= 1) return { error: "Ҳадди ақал як админ лозим аст" };
  }

  const data: { name: string; role: string; password?: string } = { name, role };
  if (password) {
    if (password.length < 4) return { error: "Рамз хеле кӯтоҳ аст (ҳадди ақал 4 аломат)" };
    data.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/users");
  return { ok: true };
}

export async function deleteUser(formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");

  if (id === admin.id) return { error: "Худро нест карда наметавонед" };

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return { error: "Корбар ёфт нашуд" };

  // never remove the last admin
  if (target.role === "admin") {
    const admins = await prisma.user.count({ where: { role: "admin" } });
    if (admins <= 1) return { error: "Ҳадди ақал як админ лозим аст" };
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return { error: "Нест карда нашуд" };
  }

  revalidatePath("/users");
  return { ok: true };
}
