// Production seed: only the login accounts — NO sample donations/expenses.
// Passwords come from env (ADMIN_PASSWORD / VIEWER_PASSWORD); re-running with a
// new value rotates the password. Safe to run on every deploy (idempotent).
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
  const viewerPass = await bcrypt.hash(process.env.VIEWER_PASSWORD || "viewer123", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: { password: adminPass, role: "admin" },
    create: { username: "admin", name: "Админ", password: adminPass, role: "admin" },
  });
  await prisma.user.upsert({
    where: { username: "viewer" },
    update: { password: viewerPass, role: "viewer" },
    create: { username: "viewer", name: "Меҳмон", password: viewerPass, role: "viewer" },
  });

  console.log("Prod seed: admin + viewer ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
