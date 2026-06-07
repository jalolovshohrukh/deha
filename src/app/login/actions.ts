"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createSession, logAudit } from "@/lib/auth";

export async function loginAction(_prev: any, formData: FormData) {
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!username || !password) {
    return { error: "Ном ва рамзро ворид кунед" };
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: "Ном ё рамз нодуруст аст" };
  }

  await createSession({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as "admin" | "viewer",
  });
  await logAudit(user.id, "login", "user", user.id);

  redirect("/");
}
